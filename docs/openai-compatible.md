# OpenAI-compatible endpoints

## Speech-to-text contract

LocalScribe accepts a base URL with or without `/v1`, or a complete `/audio/transcriptions` URL. It normalizes these forms to exactly one endpoint such as:

```text
POST https://example.test/v1/audio/transcriptions
```

The request is `multipart/form-data` with:

- `file`: mono WAV (`audio/wav`)
- `model`: configured model name
- `response_format`: `json`
- `language`: omitted for blank/`auto`, otherwise the selected language code

The response must be JSON with a string `text` property.

When the API key is blank, LocalScribe omits `Authorization` completely. When present, it sends `Authorization: Bearer <key>`. Other authentication schemes are intentionally not built in.

Example:

```bash
curl -X POST 'http://127.0.0.1:8000/v1/audio/transcriptions' \
  -F 'file=@sample.wav;type=audio/wav' \
  -F 'model=my-asr-model' \
  -F 'response_format=json'
```

## Language-model contract

Configure an OpenAI-compatible base URL, model, and optional Bearer key for cleanup, summaries, notes/chat, and AI actions. Local llama-server models remain available. Depending on the endpoint capability, the generic client uses OpenAI-compatible response/chat semantics; `/v1/chat/completions` is the compatibility baseline. Recording, transcription, and ordinary note editing do not require an LLM.

## Troubleshooting

- `401`/`403`: the service requires a Bearer key, or the key is invalid. An empty field intentionally sends no header.
- `404`: check whether the configured value already contains `/v1` or the full transcription endpoint; LocalScribe normalizes these but cannot infer a vendor-specific path.
- Timeout: each meeting request has a bounded timeout. A failed chunk is reported while later chunks continue.
- Missing `text`: ensure the server returns `{ "text": "..." }` for transcription responses.

Run local contract tests with `npm test`. For an opt-in live check, set `LOCALSCRIBE_STT_BASE_URL`, optionally set `LOCALSCRIBE_STT_MODEL` and `LOCALSCRIBE_STT_API_KEY`, then run `npm run test:stt-live`.
