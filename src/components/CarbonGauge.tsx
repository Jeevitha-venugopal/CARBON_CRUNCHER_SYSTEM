import { motion } from "framer-motion";
import { MONTHLY_LIMIT_KG } from "@/lib/carbon";

interface CarbonGaugeProps {
  total: number;
  className?: string;
}

export default function CarbonGauge({ total, className = "" }: CarbonGaugeProps) {
  const percentage = Math.min((total / MONTHLY_LIMIT_KG) * 100, 100);
  const isOver = total > MONTHLY_LIMIT_KG;
  const saved = Math.max(MONTHLY_LIMIT_KG - total, 0);

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="80" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
          <motion.circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke={isOver ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-display font-bold ${isOver ? "text-destructive" : "text-foreground"}`}>
            {total.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground">kg CO₂</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm text-muted-foreground">
          Limit: <span className="font-semibold text-foreground">{MONTHLY_LIMIT_KG} kg</span>
        </p>
        {isOver ? (
          <p className="text-sm text-destructive font-medium mt-1">
            ⚠️ {(total - MONTHLY_LIMIT_KG).toFixed(1)} kg over limit
          </p>
        ) : (
          <p className="text-sm text-primary font-medium mt-1">
            🌱 {saved.toFixed(1)} kg saved = {saved.toFixed(0)} credits
          </p>
        )}
      </div>
    </div>
  );
}
