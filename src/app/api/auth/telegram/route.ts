import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ALLOWED_USERNAME = process.env.TELEGRAM_ALLOWED_USERNAME;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ALLOWED_USERNAME || !TELEGRAM_USER_ID) {
  throw new Error('Telegram yapılandırma bilgileri eksik!');
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    // Sadece izin verilen kullanıcı adını kontrol et
    if (username !== TELEGRAM_ALLOWED_USERNAME) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı ile giriş yapamazsınız.' },
        { status: 403 }
      );
    }

    // Tek kullanımlık token oluştur
    const loginToken = crypto.randomBytes(32).toString('hex');
    
    // Kullanıcıyı veritabanında kontrol et veya oluştur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select()
      .eq('telegram_username', username)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    if (!user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ telegram_username: username }]);

      if (insertError) throw insertError;
    }

    // Telegram bot üzerinden mesaj gönder
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const loginUrl = `${request.nextUrl.origin}/auth/callback?token=${loginToken}`;
    
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