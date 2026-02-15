import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Lightbulb, Leaf, Droplets, Zap, Car, ShoppingBag, Trash2, UtensilsCrossed } from "lucide-react";

interface CategoryTotal {
  category: string;
  total: number;
}

const categoryRecommendations: Record<string, { icon: React.ReactNode; title: string; tips: string[] }> = {
  transport: {
    icon: <Car className="w-5 h-5" />,
    title: "Transportation",
    tips: [
      "Use public transport (bus, metro) instead of personal vehicles — saves up to 80% emissions per trip.",
      "Carpool with colleagues or neighbours to halve your per-person vehicle emissions.",
      "Consider switching to an electric vehicle or electric two-wheeler for daily commutes.",
      "For short distances (<3 km), prefer walking or cycling — zero emissions and great for health.",
      "Combine multiple errands into a single trip to reduce total kilometres driven.",
      "Use video calls instead of travelling for meetings when possible.",
      "Offset unavoidable flights by supporting verified carbon offset projects.",
    ],
  },
  home_energy: {
    icon: <Zap className="w-5 h-5" />,
    title: "Home Energy & Cooking",
    tips: [
      "Switch to LED lighting — saves 75% electricity vs incandescent bulbs.",
      "Use BEE 5-star rated appliances (AC, refrigerator, fans) for maximum efficiency.",
      "Install solar panels or subscribe to a solar co-op — India gets 300+ sunny days/year.",
      "Set AC temperature to 24°C or higher — each degree lower increases consumption by 6%.",
      "Use pressure cookers to reduce cooking time and LPG consumption by up to 70%.",
      "Consider induction cooking — more efficient than LPG and produces no direct emissions.",
      "Use natural ventilation and ceiling fans before turning on air conditioning.",
      "Unplug devices when not in use to eliminate phantom/standby power consumption.",
    ],
  },
  food: {
    icon: <UtensilsCrossed className="w-5 h-5" />,
    title: "Food & Diet",
    tips: [
      "Increase plant-based meals — vegetarian diets produce ~40% less emissions than heavy non-veg.",
      "Reduce food waste by planning meals, using leftovers, and composting scraps.",
      "Buy seasonal and locally-grown produce to cut transport emissions.",
      "Reduce rice consumption where possible — rice paddies emit significant methane.",
      "Grow herbs and vegetables at home — even a small kitchen garden helps.",
      "Avoid processed and packaged foods — they have higher embedded carbon.",
      "Use reusable containers and bags when shopping for groceries.",
    ],
  },
  shopping: {
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "Electronics & Shopping",
    tips: [
      "Extend the lifespan of electronics — repair instead of replacing.",
      "Buy refurbished electronics when possible to reduce manufacturing emissions.",
      "Sell or donate old electronics instead of discarding them.",
      "Choose energy-efficient devices with BEE star ratings.",
      "Reduce impulse purchases — each smartphone has ~70 kg CO₂ in manufacturing.",
      "Opt for quality over quantity when buying clothes — fast fashion has a huge carbon footprint.",
      "Support brands with transparent sustainability practices.",
    ],
  },
  water: {
    icon: <Droplets className="w-5 h-5" />,
    title: "Water Usage",
    tips: [
      "Install low-flow showerheads and faucet aerators — saves 30-50% water.",
      "Fix leaky taps immediately — a dripping tap wastes ~15 litres/day.",
      "Use a bucket instead of a running shower — saves up to 100 litres per bath.",
      "Install rainwater harvesting — reduces dependence on energy-intensive water supply.",
      "Use RO reject water for mopping, gardening, or flushing.",
      "Run washing machines and dishwashers only with full loads.",
      "Water plants in early morning or evening to reduce evaporation loss.",
    ],
  },
  waste: {
    icon: <Trash2 className="w-5 h-5" />,
    title: "Waste Management",
    tips: [
      "Segregate waste into wet, dry, and hazardous categories at source.",
      "Compost kitchen waste at home — reduces landfill methane emissions by up to 60%.",
      "Maximise recycling — paper, plastic, glass, and metal can all be recycled.",
      "Avoid single-use plastics — carry reusable bags, bottles, and containers.",
      "Donate usable items instead of throwing them away.",
      "Reduce packaging waste by buying in bulk and choosing minimal packaging.",
      "Participate in local community clean-up and waste management drives.",
    ],
  },
};

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [topCategories, setTopCategories] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchEmissions = async () => {
      const { data } = await supabase
        .from("emissions")
        .select("category, amount")
        .eq("user_id", user.id);

      if (data && data.length > 0) {
        const totals: Record<string, number> = {};
        data.forEach((e) => {
          totals[e.category] = (totals[e.category] || 0) + e.amount;
        });
        const sorted = Object.entries(totals)
          .map(([category, total]) => ({ category, total }))
          .sort((a, b) => b.total - a.total);
        setTopCategories(sorted);
      }
      setLoading(false);
    };
    fetchEmissions();
  }, [user]);

  const allCategories = Object.keys(categoryRecommendations);
  const orderedCategories = topCategories.length > 0
    ? [...topCategories.map((c) => c.category), ...allCategories.filter((c) => !topCategories.find((t) => t.category === c))]
    : allCategories;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Recommendations</h1>
              <p className="text-muted-foreground">Personalised tips to reduce your carbon footprint</p>
            </div>
          </div>
        </motion.div>

        {topCategories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-accent" />
              <h3 className="font-display font-semibold text-foreground">Your Priority Areas</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Based on your emission data, focus on these areas first for the biggest impact:</p>
            <div className="flex flex-wrap gap-2">
              {topCategories.slice(0, 3).map((c, i) => (
                <span key={c.category} className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  i === 0 ? "bg-destructive/10 text-destructive" : i === 1 ? "bg-orange-500/10 text-orange-600" : "bg-yellow-500/10 text-yellow-600"
                }`}>
                  #{i + 1} {categoryRecommendations[c.category]?.title || c.category} — {c.total.toFixed(0)} kg CO₂
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {orderedCategories.map((catKey, idx) => {
            const rec = categoryRecommendations[catKey];
            if (!rec) return null;
            const catTotal = topCategories.find((t) => t.category === catKey);

            return (
              <motion.div
                key={catKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="bg-card rounded-xl border border-border card-shadow overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {rec.icon}
                  </div>
                  <h3 className="font-display font-semibold text-foreground flex-1">{rec.title}</h3>
                  {catTotal && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {catTotal.total.toFixed(0)} kg CO₂ recorded
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {rec.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-0.5 text-sm font-bold">{i + 1}.</span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
