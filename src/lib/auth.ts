/** Local-only compatibility helpers for code paths shared with upstream. */
export const AUTH_URL = "";

export async function signOut(): Promise<void> {
  localStorage.setItem("isSignedIn", "false");
}

export async function deleteAccount(): Promise<{ error?: Error }> {
  return { error: new Error("LocalScribe does not have accounts") };
}

export async function withSessionRefresh<T>(operation: () => Promise<T>): Promise<T> {
  return operation();
}

export function isWithinGracePeriod(): boolean {
  return false;
}
