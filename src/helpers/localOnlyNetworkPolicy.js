const BLOCKED_HOSTS = new Set([
  "openwhispr.com",
  "auth.openwhispr.com",
  "api.openwhispr.com",
  "notes.openwhispr.com",
  "mcp.openwhispr.com",
  "stripe.com",
  "api.stripe.com",
  "checkout.stripe.com",
]);

function isBlockedLocalOnlyUrl(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return [...BLOCKED_HOSTS].some(
      (blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`)
    );
  } catch {
    return false;
  }
}

module.exports = { BLOCKED_HOSTS, isBlockedLocalOnlyUrl };
