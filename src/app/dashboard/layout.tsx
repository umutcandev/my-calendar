"use client";

import { Calendar, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser, User } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.replace("/");
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Auth error:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [router]);

  if (isLoading) {
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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            <h1 className="text-xl font-bold md:block hidden">Takvim Uygulaması</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground md:block hidden">
              {user?.telegram_username}
            </span>
            <button
              onClick={logoutUser}
              className="flex items-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md px-3 py-2"
            >
              <LogOut className="h-5 w-5" />
              <span className="md:block hidden">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>
      <main className="container px-4 py-8">{children}</main>
    </div>
  );
} 