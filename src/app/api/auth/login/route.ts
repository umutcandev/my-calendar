import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

const ALLOWED_USERNAME = "irkcigenc";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Kullanıcı adı gerekli" },
        { status: 400 }
      );
    }

    // Kullanıcı adını kontrol et
    if (username.toLowerCase() !== ALLOWED_USERNAME.toLowerCase()) {
      return NextResponse.json(
        { error: "Geçersiz kullanıcı adı" },
        { status: 403 }
      );
    }

    // Kullanıcıyı kontrol et
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select()
      .eq("telegram_username", username)
      .single();

    if (userError) {
      console.error("Kullanıcı kontrolü hatası:", userError);
      return NextResponse.json(
        { error: "Kullanıcı kontrolü başarısız" },
        { status: 500 }
      );
    }

    // Benzersiz token oluştur
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Eski doğrulama token'larını sil
    const { error: deleteError } = await supabaseAdmin
      .from("verifications")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Token silme başarısız" },
        { status: 500 }
      );
    }

    // Yeni token'ı kaydet
    const { error: insertError } = await supabaseAdmin
      .from("verifications")
      .insert([
        {
          user_id: user.id,
          token_hash: tokenHash,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      return NextResponse.json(
        { error: "Token kaydetme başarısız" },
        { status: 500 }
      );
    }

    // Telegram'a mesaj gönder
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
      "http://localhost:3000");

    const telegramResponse = await fetch(`${baseUrl}/api/auth/telegram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        token,
      }),
    });

    if (!telegramResponse.ok) {
      // Telegram hatası durumunda token'ı sil
      await supabaseAdmin
        .from("verifications")
        .delete()
        .eq("token_hash", tokenHash);

      return NextResponse.json(
        { error: "Telegram mesajı gönderilemedi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Doğrulama kodu Telegram'a gönderildi",
    });
  } catch (error) {
    console.error("Login hatası:", error);
    return NextResponse.json(
      { error: "Giriş işlemi başarısız" },
      { status: 500 }
    );
  }
} 