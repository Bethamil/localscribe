const DEFAULT_TIMEOUT_MS = 45_000;

function buildOpenAiTranscriptionUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) throw new Error("OpenAI-compatible transcription URL is required");

  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("OpenAI-compatible transcription URL must use HTTP or HTTPS");
  }

  url.hash = "";
  const pathname = url.pathname.replace(/\/+$/, "");
  if (/\/v1\/audio\/transcriptions$/i.test(pathname)) return url.toString();
  const basePath = pathname.replace(/\/audio\/transcriptions$/i, "").replace(/\/v1$/i, "");
  url.pathname = `${basePath}/v1/audio/transcriptions`;
  return url.toString();
}

function buildBearerHeaders(apiKey) {
  const key = typeof apiKey === "string" ? apiKey.trim() : "";
  return key ? { Authorization: `Bearer ${key}` } : {};
}

function isBatchMeetingProvider(provider) {
  return provider === "local" || provider === "openai-compatible-batch";
}

function analyzePcm16(pcm) {
  if (!pcm?.length) return { rms: 0, peak: 0, silent: true };
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  if (!samples.length) return { rms: 0, peak: 0, silent: true };
  let sumSq = 0;
  let peak = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const normalized = samples[i] / 0x7fff;
    sumSq += normalized * normalized;
    peak = Math.max(peak, Math.abs(normalized));
  }
  const rms = Math.sqrt(sumSq / samples.length);
  return { rms, peak, silent: rms < 0.0015 && peak < 0.05 };
}

async function transcribeOpenAiCompatibleWav({
  wav,
  baseUrl,
  model,
  apiKey = "",
  language,
  fetchImpl = globalThis.fetch,
  signal,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  logger,
}) {
  if (!Buffer.isBuffer(wav) || wav.length <= 44) throw new Error("A valid WAV buffer is required");
  const resolvedModel = typeof model === "string" ? model.trim() : "";
  if (!resolvedModel) throw new Error("OpenAI-compatible transcription model is required");

  const endpoint = buildOpenAiTranscriptionUrl(baseUrl);
  const endpointHost = new URL(endpoint).host;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new Error("Transcription request timed out")),
    timeoutMs
  );
  const abortFromParent = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", abortFromParent, { once: true });

  try {
    const formData = new FormData();
    formData.append("file", new Blob([wav], { type: "audio/wav" }), "meeting.wav");
    formData.append("model", resolvedModel);
    formData.append("response_format", "json");
    const normalizedLanguage = typeof language === "string" ? language.trim() : "";
    if (normalizedLanguage && normalizedLanguage !== "auto") {
      formData.append("language", normalizedLanguage);
    }

    logger?.debug?.("OpenAI-compatible meeting request", {
      endpointHost,
      model: resolvedModel,
      audioDurationMs: Math.round(((wav.length - 44) / 2 / 16_000) * 1000),
      hasAuthentication: Object.keys(buildBearerHeaders(apiKey)).length > 0,
    });

    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: buildBearerHeaders(apiKey),
      body: formData,
      signal: controller.signal,
    });
    const durationMs = Date.now() - startedAt;
    logger?.debug?.("OpenAI-compatible meeting response", {
      endpointHost,
      model: resolvedModel,
      statusCode: response.status,
      durationMs,
    });
    if (!response.ok) {
      const error = new Error(`Transcription endpoint returned HTTP ${response.status}`);
      error.status = response.status;
      error.category = "http";
      throw error;
    }
    const payload = await response.json();
    if (typeof payload?.text !== "string") {
      const error = new Error("Transcription response did not contain text");
      error.category = "invalid_response";
      throw error;
    }
    return { success: true, text: payload.text };
  } catch (error) {
    const category = controller.signal.aborted
      ? "timeout_or_cancelled"
      : error.category || "network";
    logger?.error?.("OpenAI-compatible meeting request failed", {
      endpointHost,
      model: resolvedModel,
      durationMs: Date.now() - startedAt,
      statusCode: error.status,
      errorCategory: category,
    });
    error.category = category;
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromParent);
  }
}

async function transcribeMeetingChannels(channels, transcribe) {
  return Promise.all(
    Object.entries(channels).map(async ([source, audio]) => {
      try {
        return { source, result: await transcribe(source, audio) };
      } catch (error) {
        return { source, error };
      }
    })
  );
}

module.exports = {
  analyzePcm16,
  buildBearerHeaders,
  buildOpenAiTranscriptionUrl,
  isBatchMeetingProvider,
  transcribeMeetingChannels,
  transcribeOpenAiCompatibleWav,
};
