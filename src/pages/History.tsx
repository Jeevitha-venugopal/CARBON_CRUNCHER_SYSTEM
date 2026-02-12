import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { EMISSION_FACTORS } from "@/lib/carbon";
import { Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const HistoryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emissions, setEmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    if (!user) return;
    supabase
      .from("emissions")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setEmissions(data || []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("emissions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEmissions((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Deleted" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">History</h1>
          <p className="text-muted-foreground mt-1">All your recorded emissions</p>
        </motion.div>

        {loading ? (
          <p className="text-center text-muted-foreground py-20">Loading...</p>
        ) : emissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No records yet.</p>
        ) : (
          <div className="space-y-2">
            {emissions.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between bg-card rounded-xl p-4 border border-border card-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {EMISSION_FACTORS[e.category]?.label || e.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      e.source === "ocr" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {e.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{e.recorded_at}</span>
                    {e.description && <span>{e.description}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-semibold text-foreground">{Number(e.amount).toFixed(1)} kg</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
