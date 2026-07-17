export function isSelfHostedTranscription(settings) {
  const mode =
    typeof settings?.transcriptionMode === "string" ? settings.transcriptionMode.trim() : "";
  const remoteUrl =
    typeof settings?.remoteTranscriptionUrl === "string"
      ? settings.remoteTranscriptionUrl.trim()
      : "";
  return mode === "self-hosted" && remoteUrl.length > 0;
}

export function resolveDictationTranscriptionTarget(settings) {
  if (settings?.useLocalWhisper) return "local";
  if (isSelfHostedTranscription(settings)) return "self-hosted";
  return settings?.cloudTranscriptionMode === "openwhispr" ? "cloud" : "provider";
}

export function resolveSelfHostedTranscriptionApiKey(settings) {
  if (!isSelfHostedTranscription(settings)) return null;
  const apiKey =
    typeof settings?.customTranscriptionApiKey === "string"
      ? settings.customTranscriptionApiKey.trim()
      : "";
  return apiKey || null;
}

export function resolveSelfHostedTranscriptionModel(settings) {
  if (!isSelfHostedTranscription(settings)) return null;
  const model =
    typeof settings?.remoteTranscriptionModel === "string"
      ? settings.remoteTranscriptionModel.trim()
      : "";
  return model.length > 0 ? model : null;
}

export function resolveOpenAiCompatibleMeetingOptions(settings, language) {
  if (settings?.transcriptionMode !== "self-hosted") return null;
  const baseUrl =
    typeof settings.remoteTranscriptionUrl === "string"
      ? settings.remoteTranscriptionUrl.trim()
      : "";
  const model =
    typeof settings.remoteTranscriptionModel === "string"
      ? settings.remoteTranscriptionModel.trim()
      : "";
  if (!baseUrl || !model) return null;
  return {
    provider: "openai-compatible-batch",
    baseUrl,
    model,
    apiKey:
      typeof settings.remoteTranscriptionApiKey === "string"
        ? settings.remoteTranscriptionApiKey
        : "",
    language,
  };
}
