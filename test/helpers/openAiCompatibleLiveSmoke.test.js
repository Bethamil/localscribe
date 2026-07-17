const test = require("node:test");
const assert = require("node:assert/strict");
const { pcm16ToWav } = require("../../src/utils/audioUtils");
const {
  transcribeOpenAiCompatibleWav,
} = require("../../src/helpers/openAiCompatibleTranscription");

const baseUrl = process.env.LOCALSCRIBE_STT_BASE_URL || "";
const shouldRun = process.env.RUN_OPENAI_COMPATIBLE_LIVE_SMOKE === "1" && Boolean(baseUrl);

test(
  "live OpenAI-compatible transcription smoke test",
  { skip: !shouldRun, timeout: 60_000 },
  async () => {
    const sampleRate = 16_000;
    const samples = new Int16Array(sampleRate / 4);
    for (let i = 0; i < samples.length; i += 1) {
      samples[i] = Math.round(Math.sin((i / sampleRate) * 2 * Math.PI * 440) * 4000);
    }
    const wav = pcm16ToWav(Buffer.from(samples.buffer));
    const result = await transcribeOpenAiCompatibleWav({
      wav,
      baseUrl,
      model: process.env.LOCALSCRIBE_STT_MODEL || "whisper-1",
      apiKey: process.env.LOCALSCRIBE_STT_API_KEY || "",
      language: "auto",
    });
    assert.equal(typeof result.text, "string");
  }
);
