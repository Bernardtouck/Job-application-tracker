const TOKEN_KEY = 'token';

// Get the JWT token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
// Save the JWT token to localStorage
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};
// Remove the JWT token from localStorage (logout)
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};


/**
 * Decode a JWT payload without verifying the signature.
 * Signature verification happens server-side — this is just
 * for reading the expiry date client-side.
 */
const decodeTokenPayload = (token: string): { exp?: number } | null => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const json = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};
 
/**
 * Returns true only if:
 * 1. A token exists in localStorage
 * 2. The token is not expired (checked via JWT `exp` claim)
 *
 * If the token is expired, it is automatically removed.
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
 
  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) {
    // If we can't decode the token, treat it as invalid
    removeToken();
    return false;
  }
 
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp < nowInSeconds;
 
  if (isExpired) {
    removeToken(); // Auto-cleanup expired token
    return false;
  }
 
  return true;
};