// utils/auth.ts

export function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const base64Payload = token.split(".")[1];
    return JSON.parse(atob(base64Payload));
  } catch {
    return null;
  }
}

// refreshToken으로 새 accessToken 발급
export async function requestNewAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newAccessToken = data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (e) {
    console.error("AccessToken refresh 실패:", e);
    return null;
  }
}

// 로그인 상태 확인
export async function checkLoginStatus(): Promise<{
  isLoggedIn: boolean;
  isAdmin: boolean;
}> {
  let accessToken = localStorage.getItem("accessToken");
  let payload = parseJwt(accessToken);

  // accessToken 만료 또는 없음 → refresh 시도
  if (!payload || payload.exp * 1000 <= Date.now()) {
    const newAccessToken = await requestNewAccessToken();
    if (!newAccessToken) return { isLoggedIn: false, isAdmin: false };
    payload = parseJwt(newAccessToken);
  }

  return { isLoggedIn: true, isAdmin: payload?.role === "admin" };
}
