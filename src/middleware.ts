import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function middleware(request: NextRequest) {
  // Dashboard dışındaki istekleri kontrol etme
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Cookie'lerden kullanıcı bilgilerini al
  const userId = request.cookies.get("userId")?.value;
  const verified = request.cookies.get("verified")?.value === "true";

  // Kullanıcı doğrulanmamışsa ana sayfaya yönlendir
  if (!verified || !userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Supabase admin client oluştur
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Kullanıcıyı kontrol et
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select()
    .eq("id", userId)
    .single();

  // Kullanıcı bulunamadıysa veya hata varsa ana sayfaya yönlendir
  if (error || !user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
}; 