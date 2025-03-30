# Takvim Uygulaması

Telegram ile giriş yapabileceğiniz, planlarınızı yönetebileceğiniz bir takvim uygulaması.

## Özellikler

- 📅 Takvim görünümü
- 🔐 Telegram ile güvenli giriş
- ✏️ Plan ekleme, düzenleme ve silme
- 📱 Mobil uyumlu tasarım
- 🌙 Karanlık tema desteği

## Teknolojiler

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- Telegram Bot API

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/umutcandev/my-calendar.git
cd my-calendar
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri ayarlayın:
```bash
cp .env.example .env
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Çevre Değişkenleri

Uygulamanın çalışması için aşağıdaki çevre değişkenlerini ayarlamanız gerekmektedir:

- `TELEGRAM_BOT_TOKEN`: Telegram Bot Token
- `TELEGRAM_ALLOWED_USERNAME`: İzin verilen Telegram kullanıcı adı
- `TELEGRAM_USER_ID`: Telegram kullanıcı ID'si
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anonim Anahtar

## Vercel'e Deploy Etme

1. GitHub reposunu Vercel'e bağlayın
2. Çevre değişkenlerini Vercel'de ayarlayın
3. Deploy edin!

## Lisans

MIT
