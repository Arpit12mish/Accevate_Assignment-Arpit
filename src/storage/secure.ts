import * as SecureStore from "expo-secure-store";

/**
 * Store session-related values securely.
 * (SecureStore uses Keychain/Keystore internally)
 */

const TOKEN_KEY = "AUTH_TOKEN";
const USERID_KEY = "USER_ID";

// ✅ Small helper: avoid crashing app if SecureStore fails on some devices
async function safeGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, value, {
      // secure enough for auth tokens
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    return true;
  } catch {
    return false;
  }
}

async function safeDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}

/** =========================
 *  Token
 ========================= */
export async function saveToken(token: string): Promise<boolean> {
  const t = token?.trim();
  if (!t) return false;
  return safeSet(TOKEN_KEY, t);
}

export async function getToken(): Promise<string | null> {
  return safeGet(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await safeDelete(TOKEN_KEY);
}

/** =========================
 *  UserId
 ========================= */
export async function saveUserId(userId: string): Promise<boolean> {
  const id = userId?.trim();
  if (!id) return false;
  return safeSet(USERID_KEY, id);
}

export async function getUserId(): Promise<string | null> {
  return safeGet(USERID_KEY);
}

export async function clearUserId(): Promise<void> {
  await safeDelete(USERID_KEY);
}

/** =========================
 *  Session (Recommended API)
 ========================= */
export type Session = {
  token: string;
  userId: string;
};

export async function setSession(session: Session): Promise<boolean> {
  // Save token first. If token fails, do not store userId.
  const okToken = await saveToken(session.token);
  if (!okToken) return false;

  const okUser = await saveUserId(session.userId);
  if (!okUser) {
    await clearToken();
    return false;
  }

  return true;
}

export async function getSession(): Promise<Session | null> {
  const token = await getToken();
  const userId = await getUserId();
  if (!token || !userId) return null;
  return { token, userId };
}

export async function clearSession(): Promise<void> {
  // parallel delete
  await Promise.all([clearToken(), clearUserId()]);
}

/** =========================
 *  Utility
 ========================= */
export function isProbablyValidToken(token: string | null): boolean {
  if (!token) return false;
  const t = token.trim();
  // lightweight sanity checks
  if (t.length < 10) return false;
  // some APIs return "Bearer ..." already, ensure we store raw token only
  if (t.toLowerCase().startsWith("bearer ")) return false;
  return true;
}
