"use client";

import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUser, loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsChecking(false);
      }
    }

    init();
  }, [router]);

  const handleLogin = async () => {
    if (!username.trim()) {
      setError("Kullanıcı adı boş olamaz");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Önce kullanıcıyı veritabanına kaydet/güncelle
      const user = await loginUser(username.trim());
      if (!user) {
        throw new Error("Kullanıcı oluşturulamadı");
      }

      // Sonra Telegram mesajını gönder
      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.telegram_username }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          throw new Error(data.error);
        }
        throw new Error("Giriş işlemi sırasında bir hata oluştu");
      }

      setSuccess(true);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading && username.trim()) {
      handleLogin();
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Yükleniyor...</h1>
          <p className="text-muted-foreground">Lütfen bekleyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-4">
          <Calendar className="h-12 w-12" />
          <h1 className="text-4xl font-bold">Takvim Uygulaması</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Planlarınızı kolayca yönetin ve takip edin
        </p>
        
        {success ? (
          <div className="text-green-500">
            Telegram'ınızı kontrol edin! Size bir giriş bağlantısı gönderdik.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Telegram kullanıcı adınız"
              className="rounded-lg border border-input bg-background px-4 py-2 text-foreground"
              disabled={loading}
            />
            {error && <div className="text-red-500">{error}</div>}
            <button
              onClick={handleLogin}
              disabled={loading || !username.trim()}
              className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
