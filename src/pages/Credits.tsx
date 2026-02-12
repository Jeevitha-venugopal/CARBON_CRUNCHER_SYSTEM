import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { MONTHLY_LIMIT_KG } from "@/lib/carbon";
import { Award, TrendingUp } from "lucide-react";

interface MonthlyData {
  month: number;
  year: number;
  total: number;
  credits: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CreditsPage = () => {
  const { user } = useAuth();
  const [months, setMonths] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Get emissions grouped by month
    supabase
      .from("emissions")
      .select("amount, recorded_at")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .then(({ data }) => {
        const byMonth: Record<string, MonthlyData> = {};
        (data || []).forEach((e) => {
          const d = new Date(e.recorded_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (!byMonth[key]) {
            byMonth[key] = { month: d.getMonth(), year: d.getFullYear(), total: 0, credits: 0 };
          }
          byMonth[key].total += Number(e.amount);
        });

        Object.values(byMonth).forEach((m) => {
          m.credits = Math.max(MONTHLY_LIMIT_KG - m.total, 0);
        });

        const sorted = Object.values(byMonth).sort((a, b) => b.year - a.year || b.month - a.month);
        setMonths(sorted);
        setLoading(false);
      });
  }, [user]);

  const totalCredits = months.reduce((sum, m) => sum + m.credits, 0);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">Carbon Credits</h1>
          <p className="text-muted-foreground mt-1">1 kg CO₂ saved below {MONTHLY_LIMIT_KG} kg = 1 credit</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-8 border border-border card-shadow text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-gradient mb-4">
            <Award className="w-8 h-8 text-accent-foreground" />
          </div>
          <p className="text-4xl font-display font-bold text-accent">{totalCredits.toFixed(0)}</p>
          <p className="text-muted-foreground mt-1">Total Credits Earned</p>
        </motion.div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : months.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No data yet. Start calculating!</p>
        ) : (
          <div className="space-y-3">
            {months.map((m, i) => {
              const isOver = m.total > MONTHLY_LIMIT_KG;
              return (
                <motion.div
                  key={`${m.year}-${m.month}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between bg-card rounded-xl p-5 border border-border card-shadow"
                >
                  <div>
                    <p className="font-display font-semibold text-foreground">{MONTH_NAMES[m.month]} {m.year}</p>
                    <p className="text-sm text-muted-foreground">{m.total.toFixed(1)} kg CO₂ emitted</p>
                  </div>
                  <div className="text-right">
                    {isOver ? (
                      <div className="flex items-center gap-1 text-destructive">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">Over limit</span>
                      </div>
                    ) : (
                      <p className="text-xl font-display font-bold text-accent">+{m.credits.toFixed(0)}</p>
                    )}
                    <p className="text-xs text-muted-foreground">credits</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CreditsPage;
