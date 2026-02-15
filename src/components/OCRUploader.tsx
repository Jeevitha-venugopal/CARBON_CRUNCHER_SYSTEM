import { useState } from "react";
import { Upload, FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OCR_CATEGORIES, EMISSION_FACTORS } from "@/lib/carbon";
import { motion } from "framer-motion";

interface OCRUploaderProps {
  onExtracted: (category: string, value: number) => void;
}

const ocrLabels: Record<string, { label: string; icon: string }> = {
  electricity: { label: "Electricity Bill", icon: "⚡" },
  petrol: { label: "Fuel Receipt", icon: "⛽" },
  diesel: { label: "Diesel Receipt", icon: "⛽" },
  bus: { label: "Bus Ticket", icon: "🚌" },
  train: { label: "Train Ticket", icon: "🚆" },
  clothing: { label: "Clothing Receipt", icon: "👕" },
};

export default function OCRUploader({ onExtracted }: OCRUploaderProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const handleUpload = async (category: string, file: File) => {
    setUploading(category);
    
    // Simulate OCR extraction (in production, this would call an edge function with an OCR API)
    await new Promise((r) => setTimeout(r, 1500));
    
    // Simulated extracted value based on category
    const simulatedValues: Record<string, number> = {
      electricity: 150 + Math.random() * 200,
      petrol: 20 + Math.random() * 40,
      diesel: 25 + Math.random() * 35,
      bus: 50 + Math.random() * 100,
      train: 100 + Math.random() * 300,
      clothing: 1 + Math.floor(Math.random() * 4),
    };

    const value = parseFloat((simulatedValues[category] || 0).toFixed(1));
    onExtracted(category, value);
    setCompleted((prev) => new Set(prev).add(category));
    setUploading(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Upload className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Upload Bills & Receipts</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">OCR</span>
      </div>
      <p className="text-sm text-muted-foreground">Upload images to auto-extract values. You can confirm or edit before calculating.</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {OCR_CATEGORIES.map((cat) => {
          const info = ocrLabels[cat];
          if (!info) return null;
          const isUploading = uploading === cat;
          const isDone = completed.has(cat);

          return (
            <motion.label
              key={cat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDone
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(cat, file);
                }}
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : isDone ? (
                <Check className="w-6 h-6 text-primary" />
              ) : (
                <span className="text-2xl">{info.icon}</span>
              )}
              <span className="text-xs font-medium text-center text-foreground">{info.label}</span>
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}
