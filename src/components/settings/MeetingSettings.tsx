import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Cpu, Network } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import { InferenceModeSelector, SettingsRow } from "../ui/SettingsSection";
import type { InferenceModeOption } from "../ui/SettingsSection";
import { Toggle } from "../ui/toggle";
import TranscriptionModelPicker from "../TranscriptionModelPicker";
import SelfHostedPanel from "../SelfHostedPanel";
import type { InferenceMode } from "../../types/electron";

export function MeetingSpeakerDetectionRow() {
  const { t } = useTranslation();
  const speakerDiarizationEnabled = useSettingsStore((s) => s.speakerDiarizationEnabled);
  const setSpeakerDiarizationEnabled = useSettingsStore((s) => s.setSpeakerDiarizationEnabled);

  return (
    <SettingsRow
      label={t("settings.meeting.speakerDetection.title")}
      description={t("settings.meeting.speakerDetection.description")}
    >
      <Toggle checked={speakerDiarizationEnabled} onChange={setSpeakerDiarizationEnabled} />
    </SettingsRow>
  );
}

const noop = () => {};

export function MeetingTranscriptionPanel() {
  const { t } = useTranslation();

  const {
    meetingTranscriptionMode,
    setMeetingTranscriptionMode,
    setMeetingUseLocalWhisper,
    meetingWhisperModel,
    setMeetingWhisperModel,
    meetingLocalTranscriptionProvider,
    setMeetingLocalTranscriptionProvider,
    meetingParakeetModel,
    setMeetingParakeetModel,
    meetingRemoteTranscriptionUrl,
    setMeetingRemoteTranscriptionUrl,
    meetingRemoteTranscriptionModel,
    setMeetingRemoteTranscriptionModel,
    meetingRemoteTranscriptionApiKey,
    setMeetingRemoteTranscriptionApiKey,
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
    if (mode === meetingTranscriptionMode) return;
    setMeetingTranscriptionMode(mode);
    setMeetingUseLocalWhisper(mode === "local");
  };

  const handleLocalTranscriptionModelSelect = useCallback(
    (modelId: string) => {
      if (meetingLocalTranscriptionProvider === "nvidia") {
        setMeetingParakeetModel(modelId);
      } else {
        setMeetingWhisperModel(modelId);
      }
    },
    [meetingLocalTranscriptionProvider, setMeetingParakeetModel, setMeetingWhisperModel]
  );

  const renderTranscriptionPicker = () => (
    <TranscriptionModelPicker
      streamingOnly
      selectedCloudProvider=""
      onCloudProviderSelect={noop}
      selectedCloudModel=""
      onCloudModelSelect={noop}
      selectedLocalModel={
        meetingLocalTranscriptionProvider === "nvidia" ? meetingParakeetModel : meetingWhisperModel
      }
      onLocalModelSelect={handleLocalTranscriptionModelSelect}
      selectedLocalProvider={meetingLocalTranscriptionProvider}
      onLocalProviderSelect={setMeetingLocalTranscriptionProvider}
      useLocalWhisper
      onModeChange={noop}
      mode="local"
      variant="settings"
    />
  );

  return (
    <div className="space-y-3">
      <InferenceModeSelector
        modes={transcriptionModes}
        activeMode={meetingTranscriptionMode}
        onSelect={handleTranscriptionModeSelect}
      />

      {meetingTranscriptionMode === "local" && renderTranscriptionPicker()}
      {meetingTranscriptionMode === "self-hosted" && (
        <>
          <SelfHostedPanel
            service="transcription"
            url={meetingRemoteTranscriptionUrl}
            onUrlChange={setMeetingRemoteTranscriptionUrl}
            model={meetingRemoteTranscriptionModel}
            onModelChange={setMeetingRemoteTranscriptionModel}
            apiKey={meetingRemoteTranscriptionApiKey}
            onApiKeyChange={setMeetingRemoteTranscriptionApiKey}
          />
          <p className="text-xs text-muted-foreground/80 px-1">
            {t("settingsPage.speechToText.selfHostedStreamingNote")}
          </p>
        </>
      )}
      <MeetingSpeakerDetectionRow />
    </div>
  );
}
