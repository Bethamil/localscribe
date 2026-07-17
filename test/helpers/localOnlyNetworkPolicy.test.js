const test = require("node:test");
const assert = require("node:assert/strict");
const { isBlockedLocalOnlyUrl } = require("../../src/helpers/localOnlyNetworkPolicy");

test("blocks former OpenWhispr cloud and billing hosts", () => {
  assert.equal(isBlockedLocalOnlyUrl("https://auth.openwhispr.com/api/auth/session"), true);
  assert.equal(isBlockedLocalOnlyUrl("https://api.openwhispr.com/v1/usage"), true);
  assert.equal(isBlockedLocalOnlyUrl("https://checkout.stripe.com/pay/example"), true);
});

test("allows user-configured OpenAI-compatible endpoints", () => {
  assert.equal(isBlockedLocalOnlyUrl("http://127.0.0.1:8080/v1/audio/transcriptions"), false);
  assert.equal(
    isBlockedLocalOnlyUrl("https://stt.example.com/v1/audio/transcriptions"),
    false
  );
});
