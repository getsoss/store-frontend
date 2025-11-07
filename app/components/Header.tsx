import { useState, useEffect } from "react";
import Link from "next/link";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    // JWT 체크는 동기 처리
    const token = localStorage.getItem("authToken");
    const payload = token ? parseJwt(token) : null;

    if (payload && payload.exp * 1000 > Date.now()) {
      setIsLoggedIn(true);
      const role = (payload as any)?.role;
      setIsAdmin(role === "admin");
    } else {
      localStorage.removeItem("authToken");
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, []);
  function parseJwt(token: string | null) {
    if (!token) return null;
    try {
      const base64Payload = token.split(".")[1];
      const payload = JSON.parse(atob(base64Payload));
      return payload;
    } catch (e) {
      return null;
    }
  }
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    window.location.reload();
  };
  return (
    <header className="border-b border-black">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            STORE
          </Link>
          <div className="flex items-center space-x-8">
            <Link href="/products" className="text-sm hover:underline">
              PRODUCTS
            </Link>

            {isLoggedIn ? (
              <div className="flex space-x-8">
                {isAdmin && (
                  <Link
                    href="/products/upload"
                    className="text-sm hover:underline"
                  >
                    UPLOAD
                  </Link>
                )}
                <Link href="/mypage" className="text-sm hover:underline">
                  MYPAGE
                </Link>
                <a className="text-sm hover:underline" onClick={handleLogout}>
                  LOGOUT
                </a>
              </div>
            ) : (
              <div className="flex space-x-8">
                <Link href="/signup" className="text-sm hover:underline">
                  SIGN UP
                </Link>
                <Link href="/login" className="text-sm hover:underline">
                  LOGIN
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
