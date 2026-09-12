import { clearAuthSession, refreshAuthSession } from "./authSession";

export const handleTokenRefersh = async () => {
  try {
    const accessToken = await refreshAuthSession();
    if (!accessToken) {
      clearAuthSession();
      window.location.replace("/");
    }
    return accessToken;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Token refresh error:", error);
    clearAuthSession();
    window.location.replace("/");
    return null;
  }
};
