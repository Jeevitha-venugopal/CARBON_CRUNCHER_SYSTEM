import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import CarbonGauge from "@/components/CarbonGauge";
import { MONTHLY_LIMIT_KG, EMISSION_FACTORS } from "@/lib/carbon";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Lightbulb, TrendingDown, TrendingUp, Zap } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  electricity: "#f59e0b",
  natural_gas: "#ef4444",
  petrol: "#6366f1",
  diesel: "#8b5cf6",
  car: "#a855f7",
  bus: "#06b6d4",
  train: "#14b8a6",
  flight_short: "#f43f5e",
  flight_long: "#e11d48",
  meat: "#dc2626",
  dairy: "#f97316",
  vegetables: "#22c55e",
  processed_food: "#eab308",
  clothing: "#ec4899",
  waste_general: "#78716c",
  waste_recycled: "#84cc16",
  water: "#3b82f6",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [emissions, setEmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    supabase
      .from("emissions")
      .select("*")
      .eq("user_id", user.id)
      .gte("recorded_at", startOfMonth)
      .lte("recorded_at", endOfMonth)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setEmissions(data || []);
        setLoading(false);
      });
  }, [user]);

  const totalEmissions = emissions.reduce((sum, e) => sum + Number(e.amount), 0);
  const saved = Math.max(MONTHLY_LIMIT_KG - totalEmissions, 0);
  const isOver = totalEmissions > MONTHLY_LIMIT_KG;

  // Chart data
  const byCategory: Record<string, number> = {};
  emissions.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  });
  const chartData = Object.entries(byCategory)
    .map(([cat, amount]) => ({
      name: EMISSION_FACTORS[cat]?.label || cat,
      value: parseFloat(amount.toFixed(1)),
      key: cat,
    }))
    .sort((a, b) => b.value - a.value);

  // Simple recommendations based on top categories
  const tips: string[] = [];
  const sortedCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  for (const [cat] of sortedCats.slice(0, 3)) {
    if (["transport", "petrol", "diesel", "car", "bus", "train"].includes(cat)) tips.push("🚌 Use public transport or carpool to reduce emissions");
    else if (["home_energy", "electricity", "natural_gas"].includes(cat)) tips.push("💡 Switch to LED lighting and solar panels");
    else if (["food", "meat", "dairy"].includes(cat)) tips.push("🥬 Try plant-based meals a few days a week");
    else if (["shopping", "clothing"].includes(cat)) tips.push("♻️ Buy second-hand and repair items");
    else if (cat === "water") tips.push("💧 Install low-flow fixtures");
    else if (["waste", "waste_general"].includes(cat)) tips.push("🗑️ Compost and increase recycling");
  }
  const recommendations = [...new Set(tips)];
  if (recommendations.length === 0 && emissions.length > 0) recommendations.push("🌱 Keep tracking to maintain your low carbon footprint");

  const monthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{monthName} — Your carbon footprint overview</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid sm:grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-card rounded-xl p-5 border border-border card-shadow">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Zap className="w-4 h-4" /> Total Emissions
                </div>
                <p className={`text-2xl font-display font-bold ${isOver ? "text-destructive" : "text-foreground"}`}>
                  {totalEmissions.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg CO₂</span>
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-card rounded-xl p-5 border border-border card-shadow">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  {isOver ? <TrendingUp className="w-4 h-4 text-destructive" /> : <TrendingDown className="w-4 h-4 text-primary" />}
                  {isOver ? "Over Limit" : "Under Limit"}
                </div>
                <p className={`text-2xl font-display font-bold ${isOver ? "text-destructive" : "text-primary"}`}>
                  {isOver ? `+${(totalEmissions - MONTHLY_LIMIT_KG).toFixed(1)}` : `-${saved.toFixed(1)}`}
                  <span className="text-sm font-normal text-muted-foreground"> kg</span>
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-card rounded-xl p-5 border border-border card-shadow">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  🌱 Credits Earned
                </div>
                <p className="text-2xl font-display font-bold text-accent">
                  {saved.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">credits</span>
                </p>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Gauge */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                className="bg-card rounded-xl p-6 border border-border card-shadow flex items-center justify-center">
                <CarbonGauge total={totalEmissions} />
              </motion.div>

              {/* Chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="lg:col-span-2 bg-card rounded-xl p-6 border border-border card-shadow">
                <h3 className="font-display font-semibold text-foreground mb-4">Emissions by Category</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                        formatter={(v: number) => [`${v} kg CO₂`, "Emissions"]}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry) => (
                          <Cell key={entry.key} fill={CATEGORY_COLORS[entry.key] || "#6366f1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No data yet. Use the Calculator to add emissions.</p>
                )}
              </motion.div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="bg-card rounded-xl p-6 border border-border card-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  <h3 className="font-display font-semibold text-foreground">Personalized Tips</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recommendations.map((tip, i) => (
                    <div key={i} className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">{tip}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
