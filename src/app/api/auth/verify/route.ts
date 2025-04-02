import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

const VERIFICATION_TIMEOUT = 5 * 60 * 1000; // 5 dakika

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token gerekli" },
        { status: 400 }
      );
    }

    // Token'ı hash'le
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Token'ı kontrol et
    const { data: verification, error: verificationError } = await supabaseAdmin
      .from("verifications")
      .select("*, users(*)")
      .eq("token_hash", tokenHash)
      .single();

    if (verificationError) {
      console.error("Token kontrolü hatası:", verificationError);
      
      // Token bulunamadı hatası
      if (verificationError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Geçersiz veya süresi dolmuş token" },
          { status: 403 }
        );
      }

      // Diğer hatalar
      return NextResponse.json(
        { error: "Token doğrulama hatası" },
        { status: 500 }
      );
    }

    if (!verification) {
      return NextResponse.json(
        { error: "Token bulunamadı" },
        { status: 403 }
      );
    }

    // Token süresini kontrol et
    const createdAt = new Date(verification.created_at);
    const now = new Date();
    const timeDiff = now.getTime() - createdAt.getTime();

    if (timeDiff > VERIFICATION_TIMEOUT) {
      // Süresi dolmuş token'ı sil
      await supabaseAdmin
        .from("verifications")
        .delete()
        .eq("token_hash", tokenHash);

      return NextResponse.json(
        { error: "Token süresi dolmuş" },
        { status: 403 }
      );
    }

    // Token'ı sil (tek kullanımlık)
    await supabaseAdmin
      .from("verifications")
      .delete()
      .eq("token_hash", tokenHash);

    // Kullanıcı bilgilerini döndür
    return NextResponse.json({
      user: verification.users,
      verified: true,
      message: "Doğrulama başarılı"
    });
  } catch (error) {
    console.error("Doğrulama hatası:", error);
    return NextResponse.json(
      { error: "Doğrulama işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 