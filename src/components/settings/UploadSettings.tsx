import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Cpu, Network } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import { InferenceModeSelector } from "../ui/SettingsSection";
import type { InferenceModeOption } from "../ui/SettingsSection";
import TranscriptionModelPicker from "../TranscriptionModelPicker";
import SelfHostedPanel from "../SelfHostedPanel";
import type { InferenceMode } from "../../types/electron";

export function UploadTranscriptionPanel() {
  const { t } = useTranslation();

  const {
    uploadTranscriptionMode,
    setUploadTranscriptionMode,
    setUploadUseLocalWhisper,
    uploadWhisperModel,
    setUploadWhisperModel,
    uploadLocalTranscriptionProvider,
    setUploadLocalTranscriptionProvider,
    uploadParakeetModel,
    setUploadParakeetModel,
    remoteTranscriptionUrl,
    setRemoteTranscriptionUrl,
    remoteTranscriptionModel,
    setRemoteTranscriptionModel,
    customTranscriptionApiKey,
    setCustomTranscriptionApiKey,
  } = useSettingsStore();

  const transcriptionModes: InferenceModeOption[] = [
    {
      id: "local",
      label: t("settingsPage.transcription.modes.local"),
      description: t("settingsPage.transcription.modes.localDesc"),
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: "self-hosted",
      label: t("settingsPage.transcription.modes.selfHosted"),
      description: t("settingsPage.transcription.modes.selfHostedDesc"),
      icon: <Network className="w-4 h-4" />,
    },
  ];

  const handleTranscriptionModeSelect = (mode: InferenceMode) => {
    if (mode === uploadTranscriptionMode) return;
    setUploadTranscriptionMode(mode);
    setUploadUseLocalWhisper(mode === "local");
  };

  const handleLocalTranscriptionModelSelect = useCallback(
    (modelId: string) => {
      if (uploadLocalTranscriptionProvider === "nvidia") {
        setUploadParakeetModel(modelId);
      } else {
        setUploadWhisperModel(modelId);
      }
    },
    [uploadLocalTranscriptionProvider, setUploadParakeetModel, setUploadWhisperModel]
  );

  const renderTranscriptionPicker = () => (
    <TranscriptionModelPicker
      selectedCloudProvider=""
      onCloudProviderSelect={() => {}}
      selectedCloudModel=""
      onCloudModelSelect={() => {}}
      selectedLocalModel={
        uploadLocalTranscriptionProvider === "nvidia" ? uploadParakeetModel : uploadWhisperModel
      }
      onLocalModelSelect={handleLocalTranscriptionModelSelect}
      selectedLocalProvider={uploadLocalTranscriptionProvider}
      onLocalProviderSelect={setUploadLocalTranscriptionProvider}
      useLocalWhisper
      onModeChange={() => {}}
      mode="local"
      variant="settings"
    />
  );

  return (
    <div className="space-y-3">
      <InferenceModeSelector
        modes={transcriptionModes}
        activeMode={uploadTranscriptionMode}
        onSelect={handleTranscriptionModeSelect}
      />

      {uploadTranscriptionMode === "local" && renderTranscriptionPicker()}
      {uploadTranscriptionMode === "self-hosted" && (
        <SelfHostedPanel
          service="transcription"
          url={remoteTranscriptionUrl}
          onUrlChange={setRemoteTranscriptionUrl}
          model={remoteTranscriptionModel}
          onModelChange={setRemoteTranscriptionModel}
          apiKey={customTranscriptionApiKey}
          onApiKeyChange={setCustomTranscriptionApiKey}
        />
      )}
    </div>
  );
}
