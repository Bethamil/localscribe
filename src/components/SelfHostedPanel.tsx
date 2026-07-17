import { useTranslation } from "react-i18next";
import OpenAICompatiblePanel from "./OpenAICompatiblePanel";

interface SelfHostedPanelProps {
  service: "transcription" | "reasoning";
  url: string;
  onUrlChange: (url: string) => void;
  model?: string;
  onModelChange?: (model: string) => void;
  apiKey?: string;
  onApiKeyChange?: (apiKey: string) => void;
}

export default function SelfHostedPanel({
  service,
  url,
  onUrlChange,
  model,
  onModelChange,
  apiKey,
  onApiKeyChange,
}: SelfHostedPanelProps) {
  const { t } = useTranslation();

  const placeholderUrl = "https://your-server.example.com/v1";

  return (
    <div className="border border-border rounded-lg p-3">
      <OpenAICompatiblePanel
        baseUrl={url}
        setBaseUrl={onUrlChange}
        apiKey={apiKey ?? ""}
        setApiKey={onApiKeyChange ?? (() => {})}
        model={model ?? ""}
        setModel={onModelChange ?? (() => {})}
        baseUrlPlaceholder={placeholderUrl}
        helpExamples={
          <p className="text-xs text-muted-foreground">{t("reasoning.selfHosted.endpointHelp")}</p>
        }
        forceV1BaseUrl
        showCustomModelInput={Boolean(onModelChange)}
        customModelPlaceholder={service === "transcription" ? "whisper-1" : "model-name"}
      />
    </div>
  );
}
