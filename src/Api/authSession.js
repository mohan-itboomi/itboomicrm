import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const REFRESH_COOKIE = "refreshToken";
const THREE_DAYS_SECONDS = 3 * 24 * 60 * 60;

export const getRefreshToken = () => {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${REFRESH_COOKIE}=`));
  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : null;
};

export const setRefreshToken = (token) => {
  if (!token) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent(token)}; Max-Age=${THREE_DAYS_SECONDS}; Path=/; SameSite=Strict${secure}`;
};

export const clearAuthSession = () => {
  ["acesstoken", "userData", "token", "adminUser"].forEach((key) =>
    localStorage.removeItem(key),
  );
  document.cookie = `${REFRESH_COOKIE}=; Max-Age=0; Path=/; SameSite=Strict`;
};

export const storeAuthTokens = (
  responseData,
  existingUserData = responseData,
) => {
  const payload = responseData?.data || responseData;
  const tokens = payload?.tokens || payload;
  const accessToken = tokens?.access?.token || tokens?.accessToken || payload?.accessToken || payload?.token;
  if (!accessToken) return null;

  const safeTokens = { ...tokens };
  if (safeTokens.refresh)
    safeTokens.refresh = { ...safeTokens.refresh, token: undefined };
  const responseUser = payload?.user;
  const existingUser = existingUserData?.user || existingUserData;
  const user = responseUser || existingUser || {};
  const safeUser = { ...user };
  delete safeUser.password;
  const normalizedRole = String(safeUser.role || "")
    .trim()
    .replace(/[\s_-]+/g, "")
    .toLowerCase();
  const permissions = (safeUser.permissions || [])
    .filter(
      (permission) =>
        typeof permission === "string" || permission?.enabled === true,
    )
    .map((permission) =>
      typeof permission === "string"
        ? permission
        : permission?.value || permission?.name,
    )
    .filter(Boolean);
  const sessionUser = {
    ...safeUser,
    id: safeUser._id || safeUser.id,
    accessRole: normalizedRole,
    permissions,
  };
  const updatedUserData = { user: safeUser, tokens: safeTokens };

  localStorage.setItem("acesstoken", accessToken);
  localStorage.setItem("userData", JSON.stringify(updatedUserData));
  localStorage.setItem("adminUser", JSON.stringify(sessionUser));
  setRefreshToken(
    tokens?.refresh?.token || tokens?.refreshToken || payload?.refreshToken,
  );
  return accessToken;
};

export const refreshAuthSession = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh-tokens`,
    { refreshToken },
    { headers: { Accept: "application/json" } },
  );

  let existingUserData;
  try {
    existingUserData = JSON.parse(localStorage.getItem("userData")) || {};
  } catch {
    existingUserData = {};
  }
  return storeAuthTokens(response.data, existingUserData);
};
