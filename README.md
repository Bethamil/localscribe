# LocalScribe

LocalScribe is an independent, experimental local-first fork of the MIT-licensed OpenWhispr desktop application. It keeps dictation, meeting capture, local notes, search, export, Whisper/Parakeet transcription, local speaker diarization, voice fingerprints, local models, and user-configured OpenAI-compatible endpoints. It has no account, subscription, usage quota, cloud sync, telemetry, or enabled auto-updater.

This repository is not affiliated with or endorsed by OpenWhispr. The original MIT copyright and license are preserved in [LICENSE](LICENSE).

## Why this fork?

LocalScribe exists for environments where audio and language models are exposed through ordinary OpenAI-compatible HTTP endpoints, but a vendor-specific cloud account or long-lived realtime WebSocket is unavailable, undesirable, or blocked by the network path. Reverse proxies, managed inference platforms, and private ingress commonly support regular authenticated HTTP requests while not implementing OpenAI's realtime WebSocket protocol.

The configured OpenAI-compatible speech-to-text path therefore never depends on a remote realtime WebSocket or a LocalScribe/OpenWhispr session. It uses the standard REST surface instead:

```text
GET  <base-url>/v1/models
POST <base-url>/v1/audio/transcriptions
Authorization: Bearer <optional-key>
```

This same contract is used for dictation, meeting audio, retries, and file uploads. A configured endpoint and credential remain under the user's control; the application does not silently redirect self-hosted audio to a commercial cloud fallback.

The trade-off is intentional: dictation is transcribed after the recording stops, and meetings are processed in short batches rather than producing token-by-token remote realtime output. This makes the integration simpler and more reliable across standard HTTP infrastructure while retaining local Whisper and Parakeet as fully offline alternatives.

## Speech-to-text

Each speech context exposes two modes:

- **Local**: Whisper or NVIDIA Parakeet.
- **OpenAI-compatible**: a base URL, model, optional Bearer key, and language.

The app discovers available models through `/v1/models`, while still allowing a custom model ID for servers that do not list every usable model. Dictation sends one `multipart/form-data` request after recording stops. Meetings retain separate microphone and system-audio tracks: each track is buffered independently, converted from 24 kHz PCM to 16 kHz mono WAV, and sent in parallel about every five seconds. File uploads use the same REST contract. No configured OpenAI-compatible STT endpoint is contacted through a remote realtime WebSocket.

The initial default targets a local OpenAI-compatible server:

```text
Base URL: http://127.0.0.1:8000/v1
Model:    whisper-1
```

An empty API-key field sends no `Authorization` header. A non-empty key sends `Authorization: Bearer <key>` and is stored through Electron safe storage/the OS keychain.

## Local development

Requirements: Node.js 24+, npm, and the platform build tools required by Electron/native modules.

```bash
npm ci
npm run dev
```

Validation:

```bash
npm test
npm run lint
npm run typecheck
npm run format:check
npm run build:renderer
```

Unsigned Apple Silicon package:

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false npm run build:mac:arm64
```

## Privacy and network behavior

LocalScribe starts and operates without an account. Notes, history, speaker data, settings, and retained audio stay in its own `LocalScribe` user-data directory. Legacy OpenWhispr and Stripe hosts are blocked by the Electron network policy. External AI traffic occurs only after a recording/action uses an endpoint configured in Settings. Model downloads are user initiated. Request logs contain host, model, status, duration, audio duration, and error category—never keys, authorization headers, audio, or transcript text.

See [OpenAI-compatible endpoints](docs/openai-compatible.md) and [fork notes](FORK_NOTES.md).

## License

MIT. Copyright (c) 2024 OpenWhispr Team. See [LICENSE](LICENSE) for the complete unchanged license text.
