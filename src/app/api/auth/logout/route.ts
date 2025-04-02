import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "User ID gerekli" }), {
        status: 400,
      });
    }

    // Son giriş zamanını güncelle
    const { error } = await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Logout error:", error);
      return new NextResponse(JSON.stringify({ error: "Çıkış yapılamadı" }), {
        status: 500,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
} 