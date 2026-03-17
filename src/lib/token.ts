import { createIsomorphicFn, createClientOnlyFn } from "@tanstack/react-start";

const STORAGE_KEY = "cf-token";
const PERSIST_KEY = "cf-token-persist";

export const getToken = createIsomorphicFn()
  .server(() => null)
  .client(() => {
    return (
      localStorage.getItem(STORAGE_KEY) ??
      sessionStorage.getItem(STORAGE_KEY)
    );
  });

export const setToken = createClientOnlyFn(
  (token: string, remember: boolean) => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);

    if (remember) {
      localStorage.setItem(PERSIST_KEY, "local");
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.setItem(PERSIST_KEY, "session");
      sessionStorage.setItem(STORAGE_KEY, token);
    }
  },
);

export const clearToken = createClientOnlyFn(() => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PERSIST_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
});
