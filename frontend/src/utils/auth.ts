const AUTH_STORAGE_KEY = import.meta.env.VITE_AUTH_STORAGE_KEY;

export function isUserAuthenticated(): boolean {
  const token = localStorage.getItem("access_token");
  return !!token;
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

export const setUserData = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUserData = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const removeUserData = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
};

export const setUserAuthenticated = (isAuthenticated: boolean): void => {
  if (isAuthenticated) {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export function logoutUser(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  // Redirect to home to ensure a clean state
  window.location.href = "/";
}
