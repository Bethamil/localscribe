# LocalScribe

LocalScribe is an independent, experimental local-first fork of the MIT-licensed OpenWhispr desktop application. It keeps dictation, meeting capture, local notes, search, export, Whisper/Parakeet transcription, local speaker diarization, voice fingerprints, local models, and user-configured OpenAI-compatible endpoints. It has no account, subscription, usage quota, cloud sync, telemetry, or enabled auto-updater.

This repository is not affiliated with or endorsed by OpenWhispr. The original MIT copyright and license are preserved in [LICENSE](LICENSE).

## Speech-to-text

Each speech context exposes two modes:

- **Local**: Whisper or NVIDIA Parakeet.
- **OpenAI-compatible**: a base URL, model, optional Bearer key, and language.

Meetings retain separate microphone and system-audio tracks. In OpenAI-compatible mode, each track is buffered independently, converted from 24 kHz PCM to 16 kHz mono WAV, and sent in parallel about every five seconds with `multipart/form-data`. No remote realtime WebSocket is used.

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
