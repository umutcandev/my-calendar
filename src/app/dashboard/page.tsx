"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useMemo } from "react";
import { tr } from "date-fns/locale";
import { PlanDialog } from "@/components/plan-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { format, isSameDay, parseISO } from "date-fns";

interface Plan {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Plans fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handlePlanAdded = () => {
    fetchPlans();
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { error } = await supabase
        .from("plans")
        .delete()
        .eq("id", planId)
        .eq("user_id", user.id);

      if (error) throw error;
      fetchPlans();
    } catch (error) {
      console.error("Plan silme hatası:", error);
    }
  };

  const filteredPlans = useMemo(() => {
    if (!date) return [];
    return plans.filter((plan) => {
      const planDate = parseISO(plan.created_at);
      return isSameDay(planDate, date);
    });
  }, [plans, date]);

  const planDates = useMemo(() => {
    const dates = new Set<number>();
    plans.forEach((plan) => {
      const planDate = parseISO(plan.created_at);
      dates.add(planDate.getTime());
    });
    return Array.from(dates);
  }, [plans]);

  const formatPlanTime = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "HH:mm", { locale: tr });
    } catch (error) {
      console.error("Tarih biçimlendirme hatası:", error);
      return "--:--";
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Planlarım</h2>
        <PlanDialog onPlanAdded={handlePlanAdded} selectedDate={date} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-auto shrink-0">
          <div className="sticky top-4">
            <div className="rounded-lg border bg-card p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={tr}
                modifiers={{ 
                  hasPlans: planDates.map(d => new Date(d))
                }}
                modifiersStyles={{
                  hasPlans: {
                    backgroundColor: 'hsl(142.1 76.2% 36.3% / 0.3)',
                  }
                }}
                className="w-full lg:w-[320px]"
                classNames={{
                  months: "space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center gap-1",
                  caption_label: "text-sm font-medium",
                  nav: "flex items-center gap-1",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex",
                  head_cell: "w-9 font-normal text-[0.8rem] text-muted-foreground",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent/10 text-foreground",
                  day_outside: "opacity-50",
                  day_disabled: "opacity-50 cursor-not-allowed",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-semibold mb-4">
              {date
                ? format(date, "d MMMM yyyy", { locale: tr })
                : "Bir tarih seçin"}
            </h3>

            {loading ? (
              <p className="text-muted-foreground">Yükleniyor...</p>
            ) : date ? (
              filteredPlans.length > 0 ? (
                <div className="space-y-4">
                  {filteredPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-lg border p-4 hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{plan.title}</h4>
                          {plan.description && (
                            <p className="text-muted-foreground mt-1">
                              {plan.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatPlanTime(plan.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <PlanDialog
                            mode="edit"
                            plan={plan}
                            selectedDate={date}
                            onPlanAdded={handlePlanAdded}
                          />
                          <DeleteDialog
                            title={plan.title}
                            onConfirm={() => handleDeletePlan(plan.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Bu tarihte plan bulunmuyor.</p>
              )
            ) : (
              <p className="text-muted-foreground">
                Planları görüntülemek için bir tarih seçin.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 