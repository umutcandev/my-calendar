import { supabase } from "./supabase";
import Cookies from "js-cookie";

export interface User {
  id: string;
  telegram_username: string;
  verified?: boolean;
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null;
  
  try {
    const userId = Cookies.get("userId");
    const verified = Cookies.get("verified") === "true";
    if (!userId || !verified) return null;

    const { data: user, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (error || !user) {
      Cookies.remove("userId");
      Cookies.remove("verified");
      return null;
    }

    return { ...user, verified };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function loginUser(username: string): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Giriş işlemi başarısız oldu");
    }

    // Telegram mesajı gönderildiğinde user bilgisi gelmeyecek
    if (data.message) {
      return null;
    }

    // Eğer user bilgisi geldiyse cookie'yi ayarla
    if (data.user) {
      Cookies.set("userId", data.user.id, { expires: 1, secure: true });
      return data.user;
    }

    return null;
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Hatayı yukarı fırlat
  }
}

export async function verifyUser(token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Doğrulama başarısız");
    }

    if (data.verified && data.user) {
      Cookies.set("userId", data.user.id, { expires: 1, secure: true });
      Cookies.set("verified", "true", { expires: 1, secure: true });
      return true;
    }

    throw new Error("Doğrulama başarısız");
  } catch (error: any) {
    console.error("Verify error:", error);
    throw error;
  }
}

export async function logoutUser() {
  if (typeof window !== "undefined") {
    try {
      const userId = Cookies.get("userId");
      if (userId) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId })
        }).catch(console.error); // Hata olsa bile devam et
      }
    } finally {
      Cookies.remove("userId");
      Cookies.remove("verified");
      window.location.href = "/";
    }
  }
} 