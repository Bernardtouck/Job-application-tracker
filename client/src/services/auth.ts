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
// Check if the user is authenticated (i.e., has a valid token)
export const isAuthenticated = (): boolean => {
  return !!getToken();
};