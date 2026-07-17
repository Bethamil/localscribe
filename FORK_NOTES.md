# LocalScribe fork notes

## Provenance

- Upstream: `https://github.com/OpenWhispr/openwhispr.git`
- Baseline commit: `d5b95d6429420c45fb08c8a8f9df0926ffdd777d` (OpenWhispr 1.7.5)
- Local branch: `feature/local-openai-only`
- Original remote is retained as `upstream`; no publication remote was added.

## Architectural changes

- Product identity is centralized in `product.config.json`; the app ID, protocol, keychain namespace, user-data directory, and artwork are isolated from upstream installations.
- The updater is a network-free no-op and packaging has no publish target, signing identity, or notarization configuration.
- Accounts, account onboarding, usage fetching, upgrade/referral UI, cloud-sync triggers, workspace navigation, Google Calendar OAuth startup, and commercial provider selection are removed from active UI/runtime paths.
- Electron blocks legacy OpenWhispr and Stripe hosts as a defense-in-depth rule.
- Meeting self-hosted routing selects `openai-compatible-batch`, reusing the established five-second local batch path instead of a remote realtime WebSocket.
- Microphone and system chunks are transcribed concurrently; existing silence checks, echo/duplicate suppression, diarization, speaker fallbacks, final flush, and timeout behavior remain in place.
- STT and LLM settings expose Local and OpenAI-compatible choices. LLM features are optional; ordinary notes and recording continue without an LLM.

Some legacy database columns are intentionally retained to avoid destructive migrations. They are not needed by the local-only runtime.

## Taking upstream changes

Fetch `upstream`, inspect upstream release notes and migrations, then rebase or cherry-pick into a temporary integration branch. Re-run the network-policy audit, REST meeting tests, full quality suite, and unsigned packaging before merging. Pay special attention to upstream changes in `main.js`, `preload.js`, `ipcHandlers.js`, settings resolution, authentication, sync, billing, and updater code.
