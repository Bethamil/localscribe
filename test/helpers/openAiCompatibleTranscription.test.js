const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const {
  analyzePcm16,
  buildBearerHeaders,
  buildOpenAiTranscriptionUrl,
  isBatchMeetingProvider,
  transcribeMeetingChannels,
  transcribeOpenAiCompatibleWav,
} = require("../../src/helpers/openAiCompatibleTranscription");

const wav = Buffer.concat([Buffer.alloc(44), Buffer.alloc(320)]);

test("base URL with and without /v1 resolves one transcription path", () => {
  assert.equal(
    buildOpenAiTranscriptionUrl("https://example.test"),
    "https://example.test/v1/audio/transcriptions"
  );
  assert.equal(
    buildOpenAiTranscriptionUrl("https://example.test/v1/"),
    "https://example.test/v1/audio/transcriptions"
  );
});

test("batch meeting providers bypass realtime WebSocket preparation", () => {
  assert.equal(isBatchMeetingProvider("openai-compatible-batch"), true);
  assert.equal(isBatchMeetingProvider("local"), true);
  assert.equal(isBatchMeetingProvider("openai-realtime"), false);
});

test("full transcription endpoint is not expanded twice", () => {
  assert.equal(
    buildOpenAiTranscriptionUrl("https://example.test/v1/audio/transcriptions"),
    "https://example.test/v1/audio/transcriptions"
  );
});

test("empty API key omits Authorization and a key uses Bearer auth", () => {
  assert.deepEqual(buildBearerHeaders("  "), {});
  assert.deepEqual(buildBearerHeaders("secret"), { Authorization: "Bearer secret" });
});

test("multipart request contains WAV, model, response format, and optional language", async () => {
  let request;
  const result = await transcribeOpenAiCompatibleWav({
    wav,
    baseUrl: "https://example.test/v1",
    model: "transcription-model",
    apiKey: "",
    language: "nl",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return new Response(JSON.stringify({ text: "hallo" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });
  assert.equal(result.text, "hallo");
  assert.equal(request.url, "https://example.test/v1/audio/transcriptions");
  assert.deepEqual(request.options.headers, {});
  assert.equal(request.options.body.get("model"), "transcription-model");
  assert.equal(request.options.body.get("response_format"), "json");
  assert.equal(request.options.body.get("language"), "nl");
  const file = request.options.body.get("file");
  assert.equal(file.type, "audio/wav");
  assert.equal(file.name, "meeting.wav");
});

test("auto language is omitted", async () => {
  let body;
  await transcribeOpenAiCompatibleWav({
    wav,
    baseUrl: "https://example.test",
    model: "model",
    language: "auto",
    fetchImpl: async (_url, options) => {
      body = options.body;
      return new Response(JSON.stringify({ text: "ok" }), { status: 200 });
    },
  });
  assert.equal(body.has("language"), false);
});

test("mic and system channels are transcribed concurrently", async () => {
  let active = 0;
  let maxActive = 0;
  await transcribeMeetingChannels({ mic: 1, system: 2 }, async () => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    return "ok";
  });
  assert.equal(maxActive, 2);
});

test("a failed channel does not stop the other meeting channel", async () => {
  const results = await transcribeMeetingChannels({ mic: 1, system: 2 }, async (source) => {
    if (source === "mic") throw new Error("temporary failure");
    return "still transcribed";
  });
  assert.equal(results.find((item) => item.source === "mic").error.message, "temporary failure");
  assert.equal(results.find((item) => item.source === "system").result, "still transcribed");
});

test("local mock server receives OpenAI-compatible multipart without auth", async () => {
  let observed;
  const server = http.createServer((request, response) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      observed = {
        path: request.url,
        authorization: request.headers.authorization,
        contentType: request.headers["content-type"],
        body: Buffer.concat(chunks).toString("latin1"),
      };
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ text: "mock transcript" }));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    const result = await transcribeOpenAiCompatibleWav({
      wav,
      baseUrl: `http://127.0.0.1:${address.port}/v1`,
      model: "transcription-model",
      language: "nl",
    });
    assert.equal(result.text, "mock transcript");
    assert.equal(observed.path, "/v1/audio/transcriptions");
    assert.equal(observed.authorization, undefined);
    assert.match(observed.contentType, /^multipart\/form-data; boundary=/);
    assert.match(observed.body, /name="file"; filename="meeting.wav"/);
    assert.match(observed.body, /Content-Type: audio\/wav/);
    assert.match(observed.body, /name="model"\r\n\r\ntranscription-model/);
    assert.match(observed.body, /name="response_format"\r\n\r\njson/);
    assert.match(observed.body, /name="language"\r\n\r\nnl/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("silent PCM is detected before a request is made", () => {
  assert.equal(analyzePcm16(Buffer.alloc(320)).silent, true);
  const speech = Buffer.alloc(320);
  speech.writeInt16LE(10_000, 0);
  assert.equal(analyzePcm16(speech).silent, false);
});
