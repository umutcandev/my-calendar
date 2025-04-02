"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyUser } from "@/lib/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Doğrulanıyor...");

  useEffect(() => {
    async function verifyAndRedirect() {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("Geçersiz doğrulama bağlantısı");
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      try {
        const verified = await verifyUser(token);
        if (verified) {
          setStatus("success");
          setMessage("Doğrulama başarılı! Dashboard'a yönlendiriliyorsunuz...");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          setStatus("error");
          setMessage("Doğrulama başarısız! Ana sayfaya yönlendiriliyorsunuz...");
          setTimeout(() => router.push("/"), 2000);
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Bir hata oluştu! Ana sayfaya yönlendiriliyorsunuz...");
        setTimeout(() => router.push("/"), 2000);
      }
    }

    verifyAndRedirect();
  }, [router, searchParams]);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">
        {status === "loading" && "Doğrulanıyor..."}
        {status === "success" && "Başarılı!"}
        {status === "error" && "Hata!"}
      </h1>
      <p className={`text-lg ${
        status === "success" ? "text-green-600" : 
        status === "error" ? "text-red-600" : 
        "text-muted-foreground"
      }`}>
        {message}
      </p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={
        <div className="text-center">
          <h1 className="text-2xl font-bold">Yükleniyor...</h1>
          <p className="text-muted-foreground">Lütfen bekleyin.</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
} 