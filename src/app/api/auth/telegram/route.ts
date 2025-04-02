import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID;
const ALLOWED_USERNAME = "irkcigenc";

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_USER_ID) {
  throw new Error('Telegram yapılandırma bilgileri eksik!');
}

export async function POST(request: NextRequest) {
  try {
    const { username, token } = await request.json();

    // Sadece izin verilen kullanıcı adını kontrol et
    if (username.toLowerCase() !== ALLOWED_USERNAME) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı ile giriş yapamazsınız.' },
        { status: 403 }
      );
    }

    // Telegram bot üzerinden mesaj gönder
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const loginUrl = `${request.nextUrl.origin}/auth/callback?token=${token}`;
    
    const message = `Merhaba! Takvim uygulamasına giriş yapmak için aşağıdaki bağlantıya tıklayın:\n\n${loginUrl}\n\nBu bağlantı 5 dakika içinde geçerliliğini yitirecektir.`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_USER_ID,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API hatası:', errorData);
      throw new Error('Telegram mesajı gönderilemedi');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 