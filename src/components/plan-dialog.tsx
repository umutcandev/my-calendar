"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

interface Plan {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface PlanDialogProps {
  onPlanAdded?: () => void;
  selectedDate?: Date;
  plan?: Plan;
  mode?: "create" | "edit";
}

export function PlanDialog({ onPlanAdded, selectedDate, plan, mode = "create" }: PlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (plan && mode === "edit") {
      setTitle(plan.title);
      setDescription(plan.description || "");
    }
  }, [plan, mode]);

  const getCurrentDateTime = (baseDate?: Date) => {
    const now = new Date();
    if (baseDate) {
      // Seçili tarihi kullan ama şu anki saat ve dakikayı ayarla
      const date = new Date(baseDate);
      date.setHours(now.getHours());
      date.setMinutes(now.getMinutes());
      date.setSeconds(now.getSeconds());
      date.setMilliseconds(now.getMilliseconds());
      return date;
    }
    return now;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Kullanıcı bulunamadı");
      }

      const currentDateTime = getCurrentDateTime(selectedDate);

      if (mode === "edit" && plan) {
        const { error } = await supabase
          .from("plans")
          .update({
            title,
            description,
            updated_at: currentDateTime.toISOString(),
          })
          .eq("id", plan.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("plans").insert([
          {
            user_id: user.id,
            title,
            description,
            created_at: currentDateTime.toISOString(),
            start_time: currentDateTime.toISOString(),
            end_time: currentDateTime.toISOString(),
          },
        ]);

        if (error) throw error;
      }

      setTitle("");
      setDescription("");
      setOpen(false);
      onPlanAdded?.();
    } catch (error) {
      console.error("Plan işlemi hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Plan Ekle
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Yeni Plan Ekle" : "Planı Düzenle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Plan başlığı"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Detaylar</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Plan detayları"
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Kaydediliyor..." : mode === "create" ? "Kaydet" : "Güncelle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 