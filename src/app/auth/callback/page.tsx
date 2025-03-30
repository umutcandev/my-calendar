"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Token doğrulaması başarılı, dashboard'a yönlendir
      router.push("/dashboard");
    } else {
      // Token yok veya geçersiz, ana sayfaya yönlendir
      router.push("/");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Yönlendiriliyor...</h1>
        <p className="text-muted-foreground">Lütfen bekleyin.</p>
      </div>
    </div>
  );
} 