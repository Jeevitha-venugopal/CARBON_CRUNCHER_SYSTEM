import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMISSION_FACTORS, CATEGORIES, CATEGORY_LABELS, calculateEmission } from "@/lib/carbon";

export interface ManualEntry {
  id: string;
  type: string;
  value: number;
  emission: number;
}

interface ManualInputFormProps {
  entries: ManualEntry[];
  onChange: (entries: ManualEntry[]) => void;
}

export default function ManualInputForm({ entries, onChange }: ManualInputFormProps) {
  const addEntry = () => {
    onChange([...entries, { id: crypto.randomUUID(), type: "", value: 0, emission: 0 }]);
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: "type" | "value", val: string | number) => {
    onChange(
      entries.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, [field]: val };
        if (updated.type && updated.value > 0) {
          updated.emission = calculateEmission(updated.type, updated.value as number);
        } else {
          updated.emission = 0;
        }
        return updated;
      })
    );
  };

  // Group emission types by category for the select
  const allTypes = Object.entries(CATEGORIES).flatMap(([catKey, types]) =>
    types.map((t) => ({ category: CATEGORY_LABELS[catKey], type: t, ...EMISSION_FACTORS[t] }))
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">✏️ Manual Entries</h3>
        <Button variant="outline" size="sm" onClick={addEntry} className="gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No manual entries yet. Click "Add" to start.</p>
      )}

      <div className="space-y-2">
        {entries.map((entry) => {
          const factor = EMISSION_FACTORS[entry.type];
          return (
            <div key={entry.id} className="flex items-center gap-2 bg-card rounded-lg p-3 border border-border">
              <Select value={entry.type} onValueChange={(v) => updateEntry(entry.id, "type", v)}>
                <SelectTrigger className="flex-1 min-w-[160px]">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([catKey, types]) => (
                    <div key={catKey}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{CATEGORY_LABELS[catKey]}</div>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>
                          {EMISSION_FACTORS[t].label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  className="w-24"
                  placeholder="0"
                  value={entry.value || ""}
                  onChange={(e) => updateEntry(entry.id, "value", parseFloat(e.target.value) || 0)}
                />
                {factor && <span className="text-xs text-muted-foreground w-12">{factor.unit}</span>}
              </div>
              {entry.emission > 0 && (
                <span className="text-sm font-medium text-primary whitespace-nowrap">{entry.emission} kg</span>
              )}
              <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="shrink-0">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
