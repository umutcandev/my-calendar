import { supabase } from "./supabase";

export interface User {
  id: string;
  telegram_username: string;
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null;
  
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    
    const user = JSON.parse(storedUser);
    if (!user || !user.id || !user.telegram_username) {
      localStorage.removeItem("user");
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("LocalStorage error:", error);
    return null;
  }
}

export async function loginUser(username: string): Promise<User> {
  if (!username) {
    throw new Error("Kullanıcı adı gereklidir");
  }

  try {
    // Önce mevcut kullanıcıyı kontrol et
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id, telegram_username")
      .eq("telegram_username", username)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Select error:", selectError);
      throw new Error("Kullanıcı bilgileri alınırken bir hata oluştu");
    }

    if (existingUser) {
      // Kullanıcı bulundu, last_login'i güncelle
      const { error: updateError } = await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", existingUser.id);

      if (updateError) {
        console.error("Update error:", updateError);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(existingUser));
      }
      return existingUser;
    }

    // Kullanıcı yoksa yeni kullanıcı oluştur
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{ 
        telegram_username: username,
        last_login: new Date().toISOString()
      }])
      .select("id, telegram_username")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(
        insertError.code === "23505" 
          ? "Bu kullanıcı adı zaten kullanılıyor" 
          : "Kullanıcı oluşturulurken bir hata oluştu"
      );
    }

    if (!newUser) {
      throw new Error("Kullanıcı oluşturulamadı");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(newUser));
    }

    return newUser;
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Giriş işlemi sırasında beklenmeyen bir hata oluştu");
  }
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
    }
    window.location.href = "/";
  }
} 