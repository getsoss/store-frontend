// utils/auth.ts

/**
 * JWT 토큰 파싱
 */
export function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const base64Payload = token.split(".")[1];
    return JSON.parse(atob(base64Payload));
  } catch {
    return null;
  }
}

/**
 * Refresh Token 쿠키를 이용해 새 Access Token 발급
 */
export async function requestNewAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // 쿠키 자동 포함, 클라이언트가 refreshToken을 직접 읽지 않음
    });

    if (!res.ok) return null;

    const data: { accessToken: string } = await res.json();
    if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  } catch (e) {
    console.error("AccessToken refresh 실패:", e);
    return null;
  }
}

/**
 * API 호출 시 Access Token 자동 갱신 유틸
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response | null> {
  const accessToken = localStorage.getItem("accessToken");

  // headers 안전하게 생성
  const headers: HeadersInit = new Headers(options.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let res = await fetch(url, { ...options, headers, credentials: "include" });

  if (res.status === 401) {
    // Access Token 만료 → refresh 시도
    const newAccessToken = await requestNewAccessToken();
    if (!newAccessToken) {
      localStorage.removeItem("accessToken");
      return null; // 로그인 필요
    }

    // 재요청
    const newHeaders: HeadersInit = new Headers(options.headers);
    newHeaders.set("Authorization", `Bearer ${newAccessToken}`);
    res = await fetch(url, {
      ...options,
      headers: newHeaders,
      credentials: "include",
    });
  }

  return res;
}

/**
 * 로그인 상태 확인
 */
export async function checkLoginStatus(): Promise<{
  isLoggedIn: boolean;
  isAdmin: boolean;
}> {
  let accessToken = localStorage.getItem("accessToken");
  let payload = parseJwt(accessToken);

  if (!payload || payload.exp * 1000 <= Date.now()) {
    const newAccessToken = await requestNewAccessToken();
    if (!newAccessToken) return { isLoggedIn: false, isAdmin: false };
    payload = parseJwt(newAccessToken);
  }

  return { isLoggedIn: true, isAdmin: payload?.role === "admin" };
}
