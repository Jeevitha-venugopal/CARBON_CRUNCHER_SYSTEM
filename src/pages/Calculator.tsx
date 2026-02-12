import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import OCRUploader from "@/components/OCRUploader";
import ManualInputForm, { ManualEntry } from "@/components/ManualInputForm";
import CarbonGauge from "@/components/CarbonGauge";
import { calculateEmission, getRecommendations, EMISSION_FACTORS, MONTHLY_LIMIT_KG } from "@/lib/carbon";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon, Leaf, Lightbulb } from "lucide-react";

const CalculatorPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([
    { id: crypto.randomUUID(), type: "", value: 0, emission: 0 },
  ]);
  const [ocrEntries, setOcrEntries] = useState<{ category: string; value: number; emission: number }[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOCRExtracted = (category: string, value: number) => {
    const emission = calculateEmission(category, value);
    setOcrEntries((prev) => {
      const existing = prev.findIndex((e) => e.category === category);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { category, value, emission };
        return updated;
      }
      return [...prev, { category, value, emission }];
    });
  };

  const manualTotal = manualEntries.reduce((sum, e) => sum + e.emission, 0);
  const ocrTotal = ocrEntries.reduce((sum, e) => sum + e.emission, 0);
  const grandTotal = manualTotal + ocrTotal;

  const allEmissions = [
    ...manualEntries.filter((e) => e.emission > 0).map((e) => ({ category: e.type, amount: e.emission })),
    ...ocrEntries.map((e) => ({ category: e.category, amount: e.emission })),
  ];
  const recommendations = calculated ? getRecommendations(allEmissions) : [];

  const handleCalculate = () => {
    setCalculated(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const records = [
      ...manualEntries
        .filter((e) => e.emission > 0)
        .map((e) => ({
          user_id: user.id,
          source: "manual" as const,
          category: e.type,
          amount: e.emission,
          description: `${e.value} ${EMISSION_FACTORS[e.type]?.unit || "units"}`,
        })),
      ...ocrEntries.map((e) => ({
        user_id: user.id,
        source: "ocr" as const,
        category: e.category,
        amount: e.emission,
        description: `${e.value} ${EMISSION_FACTORS[e.category]?.unit || "units"} (OCR)`,
      })),
    ];

    if (records.length === 0) {
      toast({ title: "Nothing to save", description: "Add some entries first.", variant: "destructive" });
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("emissions").insert(records);
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: `${records.length} emission records saved.` });
      navigate("/dashboard");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">Carbon Calculator</h1>
          <p className="text-muted-foreground mt-1">Upload bills or enter activities manually to calculate your footprint.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* OCR Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 border border-border card-shadow"
            >
              <OCRUploader onExtracted={handleOCRExtracted} />
              {ocrEntries.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Extracted Values</p>
                  {ocrEntries.map((e) => (
                    <div key={e.category} className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-foreground">{EMISSION_FACTORS[e.category]?.label}</span>
                      <span className="text-sm text-primary font-semibold">{e.emission} kg CO₂</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Manual Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border card-shadow"
            >
              <ManualInputForm entries={manualEntries} onChange={setManualEntries} />
            </motion.div>

            {/* Calculate Button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-3">
              <Button onClick={handleCalculate} className="eco-gradient text-primary-foreground gap-2 flex-1" size="lg">
                <CalcIcon className="w-5 h-5" /> Calculate My Carbon
              </Button>
              {calculated && (
                <Button onClick={handleSave} variant="outline" size="lg" disabled={saving} className="gap-2">
                  <Leaf className="w-5 h-5" /> {saving ? "Saving..." : "Save & View Dashboard"}
                </Button>
              )}
            </motion.div>
          </div>

          {/* Results Column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border card-shadow"
            >
              <h3 className="font-display font-semibold text-foreground mb-4 text-center">Live Preview</h3>
              <CarbonGauge total={grandTotal} />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>OCR entries</span>
                  <span className="font-medium text-foreground">{ocrTotal.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Manual entries</span>
                  <span className="font-medium text-foreground">{manualTotal.toFixed(1)} kg</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{grandTotal.toFixed(1)} kg CO₂</span>
                </div>
              </div>
            </motion.div>

            {/* Recommendations */}
            {calculated && recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-6 border border-border card-shadow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  <h3 className="font-display font-semibold text-foreground">Recommendations</h3>
                </div>
                <div className="space-y-2">
                  {recommendations.map((tip, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{tip}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CalculatorPage;
