import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  VEHICLE_TYPES, PUBLIC_TRANSPORT, CLIMATE_ZONES,
  ELECTRICITY_BILL_TO_KWH, COOKING_FUEL_OPTIONS,
  DIET_ANNUAL_CO2, FOOD_WASTE_MULTIPLIERS,
  CLOTHING_ANNUAL_CO2, ELECTRONICS_ANNUAL_CO2, ELECTRONICS_UPGRADE_MULTIPLIERS,
  WATER_USAGE_LEVELS, WATER_SOURCE_FACTORS, WATER_TREATMENT_FACTORS,
  WASTE_SIZES, WASTE_SEGREGATION, WASTE_DISPOSAL_FACTORS,
  HOME_TYPES,
  type TransportAnswers, type HomeEnergyAnswers, type FoodDietAnswers,
  type ShoppingAnswers, type WaterAnswers, type WasteAnswers, type AllAnswers,
} from "@/lib/carbon";
import { supabase } from "@/integrations/supabase/client";

interface QuestionnaireFormProps {
  onChange: (answers: AllAnswers) => void;
}

const SECTIONS = [
  { key: "transport", label: "🚗 Transportation", color: "text-indigo-500" },
  { key: "homeEnergy", label: "🔌 Home Energy", color: "text-amber-500" },
  { key: "food", label: "🍽️ Food & Diet", color: "text-green-500" },
  { key: "shopping", label: "🛍️ Shopping", color: "text-pink-500" },
  { key: "water", label: "💧 Water", color: "text-blue-500" },
  { key: "waste", label: "🗑️ Waste", color: "text-stone-500" },
];

const defaultTransport: TransportAnswers = {
  hasVehicle: false,
  vehicleType: "",
  dailyKm: 0,
  carpools: false,
  publicTransport: [],
  domesticFlightsPerYear: 0,
  internationalFlightsPerYear: 0,
  walkCycleKm: 0,
};

const defaultHomeEnergy: HomeEnergyAnswers = {
  electricityBill: "1500_3000",
  householdSize: 4,
  homeType: "2bhk",
  climateZone: "warm_humid",
  cookingFuel: "lpg",
  lpgCylindersPerYear: 12,
  pngMonthlyKg: 0,
};

const defaultFood: FoodDietAnswers = {
  dietType: "vegetarian",
  meatFreqPerWeek: 0,
  dairyFreqPerWeek: 5,
  riceFreqPerWeek: 7,
  wasteLevel: "average",
};

const defaultShopping: ShoppingAnswers = {
  clothingLevel: "moderate",
  electronicsOwned: ["smartphone"],
  upgradeFrequency: "few_years",
};

const defaultWater: WaterAnswers = {
  usageLevel: "average",
  source: "municipal",
  treatment: "basic",
};

const defaultWaste: WasteAnswers = {
  wasteSize: "medium",
  segregation: "partial",
  disposal: "landfill",
};

export default function QuestionnaireForm({ onChange }: QuestionnaireFormProps) {
  const [step, setStep] = useState(0);
  const [transport, setTransport] = useState<TransportAnswers>(defaultTransport);
  const [homeEnergy, setHomeEnergy] = useState<HomeEnergyAnswers>(defaultHomeEnergy);
  const [food, setFood] = useState<FoodDietAnswers>(defaultFood);
  const [shopping, setShopping] = useState<ShoppingAnswers>(defaultShopping);
  const [water, setWater] = useState<WaterAnswers>(defaultWater);
  const [waste, setWaste] = useState<WasteAnswers>(defaultWaste);
  const [detectingClimate, setDetectingClimate] = useState(false);

  useEffect(() => {
    onChange({ transport, homeEnergy, food, shopping, water, waste });
  }, [transport, homeEnergy, food, shopping, water, waste]);

  const detectClimate = async () => {
    setDetectingClimate(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { data } = await supabase.functions.invoke("get-climate", {
                body: { lat: pos.coords.latitude, lon: pos.coords.longitude },
              });
              if (data?.climateZone) {
                setHomeEnergy((prev) => ({ ...prev, climateZone: data.climateZone }));
              }
            } catch {
              // silently fail
            }
            setDetectingClimate(false);
          },
          () => setDetectingClimate(false)
        );
      } else {
        setDetectingClimate(false);
      }
    } catch {
      setDetectingClimate(false);
    }
  };

  const addPublicTransport = () => {
    setTransport((prev) => ({
      ...prev,
      publicTransport: [...prev.publicTransport, { type: "bus", dailyKm: 0 }],
    }));
  };

  const updatePT = (index: number, field: string, value: string | number) => {
    setTransport((prev) => ({
      ...prev,
      publicTransport: prev.publicTransport.map((pt, i) =>
        i === index ? { ...pt, [field]: value } : pt
      ),
    }));
  };

  const removePT = (index: number) => {
    setTransport((prev) => ({
      ...prev,
      publicTransport: prev.publicTransport.filter((_, i) => i !== index),
    }));
  };

  const toggleElectronics = (key: string) => {
    setShopping((prev) => ({
      ...prev,
      electronicsOwned: prev.electronicsOwned.includes(key)
        ? prev.electronicsOwned.filter((e) => e !== key)
        : [...prev.electronicsOwned, key],
    }));
  };

  const renderSection = () => {
    switch (step) {
      case 0: // Transport
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">1. Do you own or regularly use a personal vehicle?</Label>
              <div className="flex gap-3">
                <Button variant={transport.hasVehicle ? "default" : "outline"} size="sm" onClick={() => setTransport((p) => ({ ...p, hasVehicle: true }))}>Yes</Button>
                <Button variant={!transport.hasVehicle ? "default" : "outline"} size="sm" onClick={() => setTransport((p) => ({ ...p, hasVehicle: false }))}>No</Button>
              </div>
            </div>

            {transport.hasVehicle && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">2. What type of vehicle do you use most often?</Label>
                  <Select value={transport.vehicleType} onValueChange={(v) => setTransport((p) => ({ ...p, vehicleType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(VEHICLE_TYPES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">3. Average km per day with this vehicle?</Label>
                  <Input type="number" min={0} value={transport.dailyKm || ""} onChange={(e) => setTransport((p) => ({ ...p, dailyKm: parseFloat(e.target.value) || 0 }))} placeholder="e.g. 15" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">4. Do you usually carpool?</Label>
                  <div className="flex gap-3">
                    <Button variant={transport.carpools ? "default" : "outline"} size="sm" onClick={() => setTransport((p) => ({ ...p, carpools: true }))}>Yes</Button>
                    <Button variant={!transport.carpools ? "default" : "outline"} size="sm" onClick={() => setTransport((p) => ({ ...p, carpools: false }))}>No</Button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">5. Public transport usage (daily km)</Label>
              {transport.publicTransport.map((pt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Select value={pt.type} onValueChange={(v) => updatePT(i, "type", v)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PUBLIC_TRANSPORT).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" min={0} className="w-24" placeholder="km" value={pt.dailyKm || ""} onChange={(e) => updatePT(i, "dailyKm", parseFloat(e.target.value) || 0)} />
                  <Button variant="ghost" size="sm" onClick={() => removePT(i)}>✕</Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addPublicTransport}>+ Add transport</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">6. Domestic flights / year</Label>
                <Input type="number" min={0} value={transport.domesticFlightsPerYear || ""} onChange={(e) => setTransport((p) => ({ ...p, domesticFlightsPerYear: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">7. International flights / year</Label>
                <Input type="number" min={0} value={transport.internationalFlightsPerYear || ""} onChange={(e) => setTransport((p) => ({ ...p, internationalFlightsPerYear: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">8. Do you walk/cycle daily? (km/day)</Label>
              <Input type="number" min={0} value={transport.walkCycleKm || ""} onChange={(e) => setTransport((p) => ({ ...p, walkCycleKm: parseFloat(e.target.value) || 0 }))} placeholder="0 (no emissions)" />
            </div>
          </div>
        );

      case 1: // Home Energy
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">1. What is your average monthly electricity bill?</Label>
              <Select value={homeEnergy.electricityBill} onValueChange={(v) => setHomeEnergy((p) => ({ ...p, electricityBill: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_1500">Under ₹1,500</SelectItem>
                  <SelectItem value="1500_3000">₹1,500 – ₹3,000</SelectItem>
                  <SelectItem value="3000_6000">₹3,000 – ₹6,000</SelectItem>
                  <SelectItem value="over_6000">Over ₹6,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">2. How many people live in your household?</Label>
              <Input type="number" min={1} max={20} value={homeEnergy.householdSize || ""} onChange={(e) => setHomeEnergy((p) => ({ ...p, householdSize: parseInt(e.target.value) || 1 }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">3. What type of house do you live in?</Label>
              <Select value={homeEnergy.homeType} onValueChange={(v) => setHomeEnergy((p) => ({ ...p, homeType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(HOME_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{k.replace(/_/g, " ").toUpperCase()} ({v} kWh/yr)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">4. Climate zone</Label>
              <div className="flex gap-2">
                <Select value={homeEnergy.climateZone} onValueChange={(v) => setHomeEnergy((p) => ({ ...p, climateZone: v }))}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLIMATE_ZONES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={detectClimate} disabled={detectingClimate} title="Auto-detect from location">
                  {detectingClimate ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">5. Cooking fuel</Label>
              <Select value={homeEnergy.cookingFuel} onValueChange={(v) => setHomeEnergy((p) => ({ ...p, cookingFuel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(COOKING_FUEL_OPTIONS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {homeEnergy.cookingFuel === "lpg" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">6. LPG cylinders per year</Label>
                <Input type="number" min={0} max={30} value={homeEnergy.lpgCylindersPerYear || ""} onChange={(e) => setHomeEnergy((p) => ({ ...p, lpgCylindersPerYear: parseInt(e.target.value) || 0 }))} />
              </div>
            )}

            {homeEnergy.cookingFuel === "png" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">7. PNG monthly usage (kg)</Label>
                <Input type="number" min={0} value={homeEnergy.pngMonthlyKg || ""} onChange={(e) => setHomeEnergy((p) => ({ ...p, pngMonthlyKg: parseFloat(e.target.value) || 0 }))} />
              </div>
            )}
          </div>
        );

      case 2: // Food
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">1. What is your primary diet type?</Label>
              <Select value={food.dietType} onValueChange={(v) => setFood((p) => ({ ...p, dietType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="nonveg_moderate">Non-Veg Moderate</SelectItem>
                  <SelectItem value="nonveg_heavy">Non-Veg Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {food.dietType !== "vegetarian" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">2. Meat / fish / eggs frequency per week</Label>
                <Input type="number" min={0} max={21} value={food.meatFreqPerWeek || ""} onChange={(e) => setFood((p) => ({ ...p, meatFreqPerWeek: parseInt(e.target.value) || 0 }))} />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">3. Dairy consumption frequency per week</Label>
              <Input type="number" min={0} max={21} value={food.dairyFreqPerWeek || ""} onChange={(e) => setFood((p) => ({ ...p, dairyFreqPerWeek: parseInt(e.target.value) || 0 }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">4. How many meals per week include rice?</Label>
              <Input type="number" min={0} max={21} value={food.riceFreqPerWeek || ""} onChange={(e) => setFood((p) => ({ ...p, riceFreqPerWeek: parseInt(e.target.value) || 0 }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">5. Food waste habits</Label>
              <Select value={food.wasteLevel} onValueChange={(v) => setFood((p) => ({ ...p, wasteLevel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FOOD_WASTE_MULTIPLIERS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3: // Shopping
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">1. How many clothes do you buy per year?</Label>
              <Select value={shopping.clothingLevel} onValueChange={(v) => setShopping((p) => ({ ...p, clothingLevel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CLOTHING_ANNUAL_CO2).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">2. What major electronics do you own?</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ELECTRONICS_ANNUAL_CO2).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-lg border border-border cursor-pointer hover:bg-muted">
                    <Checkbox
                      checked={shopping.electronicsOwned.includes(key)}
                      onCheckedChange={() => toggleElectronics(key)}
                    />
                    <span className="text-sm">{key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{val} kg/yr</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">3. How often do you replace electronics?</Label>
              <Select value={shopping.upgradeFrequency} onValueChange={(v) => setShopping((p) => ({ ...p, upgradeFrequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ELECTRONICS_UPGRADE_MULTIPLIERS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4: // Water
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">1. How would you describe your daily water usage?</Label>
              <Select value={water.usageLevel} onValueChange={(v) => setWater((p) => ({ ...p, usageLevel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WATER_USAGE_LEVELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label} (~{v.liters}L/day)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">2. What is your main source of water?</Label>
              <Select value={water.source} onValueChange={(v) => setWater((p) => ({ ...p, source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WATER_SOURCE_FACTORS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">3. Do you treat the water before using it?</Label>
              <Select value={water.treatment} onValueChange={(v) => setWater((p) => ({ ...p, treatment: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WATER_TREATMENT_FACTORS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 5: // Waste
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">1. How much waste do you generate daily?</Label>
              <Select value={waste.wasteSize} onValueChange={(v) => setWaste((p) => ({ ...p, wasteSize: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WASTE_SIZES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">2. Do you segregate waste?</Label>
              <Select value={waste.segregation} onValueChange={(v) => setWaste((p) => ({ ...p, segregation: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WASTE_SEGREGATION).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">3. What is your primary disposal method?</Label>
              <Select value={waste.disposal} onValueChange={(v) => setWaste((p) => ({ ...p, disposal: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WASTE_DISPOSAL_FACTORS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStep(i)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              step === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="font-display font-semibold text-foreground mb-4">{SECTIONS[step].label}</h3>
          {renderSection()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <span className="text-xs text-muted-foreground self-center">{step + 1} / {SECTIONS.length}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={step === SECTIONS.length - 1}
          onClick={() => setStep((s) => s + 1)}
          className="gap-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
