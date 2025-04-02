"use client";

import { Calendar, CheckCircle, Clock, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUser, loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    title: "Kolay Planlama",
    description: "Sürükle-bırak arayüzü ile planlarınızı kolayca oluşturun ve düzenleyin."
  },
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Hatırlatmalar",
    description: "Önemli planlarınızı asla kaçırmayın, zamanında bildirimler alın."
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Güvenli Erişim",
    description: "Telegram ile güvenli giriş yapın, verileriniz güvende olsun."
  }
];

export default function Home() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
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
      }
    }

    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const user = await loginUser(username);
      if (user) {
        setSuccess("Giriş başarılı! Yönlendiriliyorsunuz...");
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setSuccess("Doğrulama kodu Telegram'a gönderildi! Lütfen mesajınızı kontrol edin.");
      }
    } catch (error: any) {
      setError(error.message || "Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Takvim Uygulaması</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Planlarınızı Kolayca Yönetin
            </h1>
            <p className="text-xl text-muted-foreground">
              Modern ve kullanıcı dostu arayüzü ile planlarınızı organize edin, takip edin ve asla önemli bir etkinliği kaçırmayın.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Telegram kullanıcı adınız"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loading}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-500/10 p-4 text-green-500">
                  {success}
                </div>
              )}
            </form>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-4">
              <div className="h-full w-full rounded-3xl bg-gradient-to-r from-primary to-primary/30 blur-xl floating-blur"></div>
            </div>
            <div className="relative rounded-3xl border bg-card p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">Haftalık Toplantı</div>
                    <div className="text-sm text-muted-foreground">Her Pazartesi 10:00</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">Proje Teslimi</div>
                    <div className="text-sm text-muted-foreground">15 Mart 2024</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">Doktor Randevusu</div>
                    <div className="text-sm text-muted-foreground">20 Mart 14:30</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <div key={i} className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
