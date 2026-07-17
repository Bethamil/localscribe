const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("the application route has no account gate or cloud sync startup", () => {
  const source = read("src/AppRouter.jsx");
  assert.doesNotMatch(source, /AuthenticationStep|startAutoSync|needsReauth/);
  assert.match(source, /onboardingCompleted/);
});

test("local sidebar has no upgrade, billing, referral, or workspace controls", () => {
  const source = read("src/components/ControlPanelSidebar.tsx");
  assert.doesNotMatch(source, /upgrade|billing|referral|workspace|subscription/i);
});

test("usage compatibility has no entitlement and no quota gate", () => {
  const source = read("src/hooks/useUsage.ts");
  assert.match(source, /isSubscribed: false/);
  assert.match(source, /isTrial: false/);
  assert.match(source, /isOverLimit: false/);
  assert.doesNotMatch(source, /cloudUsage|cloudCheckout|cloudBillingPortal/);
});

test("notes open directly without AI, account, or onboarding gates", () => {
  const source = read("src/components/notes/PersonalNotesView.tsx");
  assert.doesNotMatch(source, /NotesOnboarding|useNotesOnboarding|notesOnboardingComplete/);
});

test("batch meeting route contains no external realtime endpoint", () => {
  const source = read("src/helpers/openAiCompatibleTranscription.js");
  assert.doesNotMatch(source, /v1\/realtime|wss:\/\/api\.openai\.com/);
});
