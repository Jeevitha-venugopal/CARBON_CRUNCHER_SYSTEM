// ============================================================
// Carbon Footprint Calculation Engine — India-Specific
// Based on CEA, CPCB, BEE, IPCC data
// ============================================================

export const MONTHLY_LIMIT_KG = 480;

// ---- TRANSPORTATION ----

export const VEHICLE_TYPES = {
  petrol_small: { label: "Small Petrol Car (Swift, i10)", factor: 0.147 },
  petrol_medium: { label: "Medium Petrol Car (City, Ciaz)", factor: 0.181 },
  petrol_large: { label: "Large Car / SUV (Innova, Fortuner)", factor: 0.239 },
  diesel_small: { label: "Small Diesel Car", factor: 0.142 },
  diesel_medium: { label: "Medium Diesel Car", factor: 0.168 },
  diesel_large: { label: "Large Diesel Car / SUV", factor: 0.201 },
  cng_small: { label: "CNG Small Car", factor: 0.109 },
  cng_medium: { label: "CNG Medium Car", factor: 0.132 },
  two_wheeler_small: { label: "Two-Wheeler (100-150cc)", factor: 0.065 },
  two_wheeler_large: { label: "Two-Wheeler (>150cc)", factor: 0.089 },
  ev_two_wheeler: { label: "Electric Two-Wheeler", factor: 0.089 },
  ev_car: { label: "Electric Car", factor: 0.132 },
} as const;

export const PUBLIC_TRANSPORT = {
  bus: { label: "Bus (City)", factor: 0.089 },
  metro: { label: "Metro / Local Train", factor: 0.033 },
  auto: { label: "Auto-Rickshaw", factor: 0.174 },
  cab: { label: "Cab / Taxi", factor: 0.181 },
} as const;

export const FLIGHT_FACTORS = {
  domestic: { factor: 0.177, rfFactor: 1.9, avgDistance: 1300 },
  international: { factor: 0.156, rfFactor: 1.9, avgDistance: 5000 },
};

// ---- HOME ENERGY ----

export const GRID_EMISSION_FACTOR = 0.82; // kg CO₂/kWh (CEA 2022-23)

export const ELECTRICITY_BILL_TO_KWH: Record<string, number> = {
  under_1500: 3000,
  "1500_3000": 5400,
  "3000_6000": 9000,
  over_6000: 14400,
};

export const HOME_TYPES: Record<string, number> = {
  "1bhk": 2400,
  "2bhk": 3600,
  "3bhk": 5400,
  independent_small: 4800,
  independent_large: 8400,
};

export const CLIMATE_ZONES: Record<string, { label: string; factor: number }> = {
  hot_dry: { label: "Hot & Dry (Delhi, Rajasthan)", factor: 1.3 },
  warm_humid: { label: "Warm & Humid (Mumbai, Chennai)", factor: 1.2 },
  moderate: { label: "Moderate (Bangalore, Pune)", factor: 0.9 },
  cold: { label: "Cold (Hill Stations)", factor: 1.1 },
};

export const LPG_CO2_PER_CYLINDER = 42.3; // 14.2 kg × 2.98 kg CO₂/kg
export const PNG_CO2_PER_KG = 2.75;

export const COOKING_FUEL_OPTIONS = {
  lpg: "LPG Cylinder",
  png: "Piped Natural Gas (PNG)",
  none: "No gas cooking",
};

// ---- FOOD & DIET ----

export const DIET_ANNUAL_CO2: Record<string, number> = {
  vegetarian: 610,
  nonveg_moderate: 689,
  nonveg_heavy: 796,
};

export const FOOD_WASTE_MULTIPLIERS: Record<string, { label: string; factor: number }> = {
  minimal: { label: "Very careful, minimal waste", factor: 0.93 },
  average: { label: "Some leftovers / expired items", factor: 1.0 },
  significant: { label: "Significant waste", factor: 1.15 },
  high: { label: "High waste levels", factor: 1.30 },
};

// ---- SHOPPING & CONSUMPTION ----

export const CLOTHING_ANNUAL_CO2: Record<string, { label: string; value: number }> = {
  minimal: { label: "Minimal (≤6 items/year)", value: 75 },
  moderate: { label: "Moderate (~15 items/year)", value: 188 },
  frequent: { label: "Frequent (~30 items/year)", value: 375 },
  enthusiast: { label: "Fashion Enthusiast (50+)", value: 625 },
};

export const ELECTRONICS_ANNUAL_CO2: Record<string, number> = {
  smartphone: 28.3,
  laptop: 102.5,
  led_tv: 40,
  refrigerator: 56.3,
  ac: 89,
};

export const ELECTRONICS_UPGRADE_MULTIPLIERS: Record<string, { label: string; factor: number }> = {
  only_broken: { label: "Replace only when broken", factor: 1.0 },
  few_years: { label: "Upgrade every few years", factor: 1.5 },
  frequent: { label: "Frequent early upgrades", factor: 2.5 },
};

// ---- WATER ----

export const WATER_USAGE_LEVELS: Record<string, { label: string; liters: number }> = {
  conservative: { label: "Conservative", liters: 95 },
  average: { label: "Average", liters: 150 },
  high: { label: "High", liters: 250 },
};

export const WATER_SOURCE_FACTORS: Record<string, { label: string; factor: number }> = {
  municipal: { label: "Municipal Supply", factor: 1.0 },
  borewell: { label: "Borewell", factor: 1.2 },
  tanker: { label: "Tanker", factor: 1.5 },
};

export const WATER_TREATMENT_FACTORS: Record<string, { label: string; factor: number }> = {
  none: { label: "No Treatment", factor: 1.0 },
  basic: { label: "Basic Filtration", factor: 1.1 },
  ro_uv: { label: "RO / UV", factor: 1.3 },
};

// Water emission: 0.34 (supply) + 0.57 (wastewater) = 0.91 kg CO₂/m³
export const WATER_EMISSION_PER_M3 = 0.91;

// ---- WASTE ----

export const WASTE_SIZES: Record<string, { label: string; kgPerYear: number }> = {
  small: { label: "Small bag (~0.3 kg/day)", kgPerYear: 109.5 },
  medium: { label: "Medium bag (~0.5 kg/day)", kgPerYear: 182.5 },
  large: { label: "Large bag (~0.8 kg/day)", kgPerYear: 292 },
};

export const WASTE_SEGREGATION: Record<string, { label: string }> = {
  yes: { label: "Yes, fully" },
  partial: { label: "Partially" },
  no: { label: "No" },
};

export const WASTE_DISPOSAL_FACTORS: Record<string, { label: string; factor: number }> = {
  landfill: { label: "Landfill", factor: 0.94 },
  recycle: { label: "Recycle", factor: -0.2 },
  compost: { label: "Compost", factor: 0.15 },
  mix: { label: "Mix of methods", factor: 0.5 },
};

// ============================================================
// CALCULATION FUNCTIONS (all return kg CO₂/day)
// ============================================================

export interface TransportAnswers {
  hasVehicle: boolean;
  vehicleType: string;
  dailyKm: number;
  carpools: boolean;
  domesticFlightsPerYear: number;
  internationalFlightsPerYear: number;
  walkCycleKm: number;
}

export function calcTransportDaily(a: TransportAnswers): number {
  let annual = 0;

  // Personal vehicle
  if (a.hasVehicle && a.vehicleType && a.dailyKm > 0) {
    const factor = VEHICLE_TYPES[a.vehicleType as keyof typeof VEHICLE_TYPES]?.factor || 0;
    const usage = a.carpools ? 0.5 : 1.0;
    annual += a.dailyKm * 365 * factor * usage;
  }

  // Flights
  annual += a.domesticFlightsPerYear * FLIGHT_FACTORS.domestic.avgDistance * FLIGHT_FACTORS.domestic.factor * FLIGHT_FACTORS.domestic.rfFactor;
  annual += a.internationalFlightsPerYear * FLIGHT_FACTORS.international.avgDistance * FLIGHT_FACTORS.international.factor * FLIGHT_FACTORS.international.rfFactor;

  // Walking/cycling = 0
  return annual / 365;
}

export interface HomeEnergyAnswers {
  householdSize: number;
  climateZone: string;
  cookingFuel: string;
  lpgCylindersPerYear: number;
  pngMonthlyKg: number;
}

// Home energy now only calculates cooking fuel emissions.
// Electricity is handled via OCR bill upload and divided by householdSize in Calculator.
export function calcHomeEnergyDaily(a: HomeEnergyAnswers): number {
  let cookingEmissions = 0;
  if (a.cookingFuel === "lpg") {
    cookingEmissions = a.lpgCylindersPerYear * LPG_CO2_PER_CYLINDER;
  } else if (a.cookingFuel === "png") {
    cookingEmissions = a.pngMonthlyKg * 12 * PNG_CO2_PER_KG;
  }

  return cookingEmissions / 365;
}

export interface FoodDietAnswers {
  dietType: string;
  meatFreqPerWeek: number;
  dairyFreqPerWeek: number;
  riceFreqPerWeek: number;
  wasteLevel: string;
}

export function calcFoodDaily(a: FoodDietAnswers): number {
  const base = DIET_ANNUAL_CO2[a.dietType] || 610;

  // Additional rice adjustment (above baseline 5 meals/week)
  const extraRice = Math.max(a.riceFreqPerWeek - 5, 0) * 2.3 * 0.15 * 52;

  const wasteFactor = FOOD_WASTE_MULTIPLIERS[a.wasteLevel]?.factor || 1.0;
  return ((base + extraRice) * wasteFactor) / 365;
}

export interface ShoppingAnswers {
  electronicsOwned: string[];
  upgradeFrequency: string;
}

// Shopping now only calculates electronics.
// Clothing is handled via OCR receipt upload.
export function calcShoppingDaily(a: ShoppingAnswers): number {
  const upgradeFactor = ELECTRONICS_UPGRADE_MULTIPLIERS[a.upgradeFrequency]?.factor || 1.0;
  const electronics = a.electronicsOwned.reduce(
    (sum, e) => sum + (ELECTRONICS_ANNUAL_CO2[e] || 0),
    0
  ) * upgradeFactor;

  return electronics / 365;
}

export interface WaterAnswers {
  usageLevel: string;
  source: string;
  treatment: string;
}

export function calcWaterDaily(a: WaterAnswers): number {
  const liters = WATER_USAGE_LEVELS[a.usageLevel]?.liters || 150;
  const sourceFactor = WATER_SOURCE_FACTORS[a.source]?.factor || 1.0;
  const treatmentFactor = WATER_TREATMENT_FACTORS[a.treatment]?.factor || 1.0;
  const adjustedLiters = liters * (sourceFactor + treatmentFactor);
  const m3PerYear = (adjustedLiters * 365) / 1000;
  return (m3PerYear * WATER_EMISSION_PER_M3) / 365;
}

export interface WasteAnswers {
  wasteSize: string;
  segregation: string;
  disposal: string;
}

export function calcWasteDaily(a: WasteAnswers): number {
  const kgPerYear = WASTE_SIZES[a.wasteSize]?.kgPerYear || 182.5;
  const disposalFactor = WASTE_DISPOSAL_FACTORS[a.disposal]?.factor || 0.94;

  let segregationReduction = 1.0;
  if (a.segregation === "yes") segregationReduction = 0.6;
  else if (a.segregation === "partial") segregationReduction = 0.8;

  return (kgPerYear * disposalFactor * segregationReduction) / 365;
}

// ---- TOTAL ----

export interface AllAnswers {
  transport: TransportAnswers;
  homeEnergy: HomeEnergyAnswers;
  food: FoodDietAnswers;
  shopping: ShoppingAnswers;
  water: WaterAnswers;
  waste: WasteAnswers;
}

export interface CategoryBreakdown {
  category: string;
  label: string;
  dailyKg: number;
  annualKg: number;
}

export function calcTotalBreakdown(answers: AllAnswers): CategoryBreakdown[] {
  const transport = calcTransportDaily(answers.transport);
  const homeEnergy = calcHomeEnergyDaily(answers.homeEnergy);
  const food = calcFoodDaily(answers.food);
  const shopping = calcShoppingDaily(answers.shopping);
  const water = calcWaterDaily(answers.water);
  const waste = calcWasteDaily(answers.waste);

  return [
    { category: "transport", label: "🚗 Transportation", dailyKg: transport, annualKg: transport * 365 },
    { category: "home_energy", label: "🔌 Cooking Fuel", dailyKg: homeEnergy, annualKg: homeEnergy * 365 },
    { category: "food", label: "🍽️ Food & Diet", dailyKg: food, annualKg: food * 365 },
    { category: "shopping", label: "🛍️ Electronics", dailyKg: shopping, annualKg: shopping * 365 },
    { category: "water", label: "💧 Water", dailyKg: water, annualKg: water * 365 },
    { category: "waste", label: "🗑️ Waste", dailyKg: waste, annualKg: waste * 365 },
  ];
}

export function getRecommendations(breakdown: CategoryBreakdown[]): string[] {
  const sorted = [...breakdown].sort((a, b) => b.dailyKg - a.dailyKg);
  const tips: string[] = [];

  for (const item of sorted.slice(0, 3)) {
    if (item.dailyKg <= 0) continue;
    switch (item.category) {
      case "transport":
        tips.push("🚌 Use public transport, carpool, or switch to EVs to cut transport emissions");
        break;
      case "home_energy":
        tips.push("💡 Switch to LED lighting, solar panels, and 5-star rated appliances");
        break;
      case "food":
        tips.push("🥬 Try more plant-based meals and reduce food waste");
        break;
      case "shopping":
        tips.push("♻️ Repair electronics instead of replacing, extend device lifespans");
        break;
      case "water":
        tips.push("💧 Install low-flow fixtures and use rainwater harvesting");
        break;
      case "waste":
        tips.push("🗑️ Segregate waste, compost organic waste, and maximize recycling");
        break;
    }
  }

  if (tips.length === 0) tips.push("🌱 Great job! Keep tracking to maintain your low carbon footprint");
  return tips;
}

// Legacy export for OCR uploader — these categories are handled via bill uploads
export const EMISSION_FACTORS: Record<string, { factor: number; unit: string; label: string }> = {
  electricity: { factor: 0.82, unit: "kWh", label: "Electricity" },
  petrol: { factor: 2.31, unit: "liters", label: "Petrol / Gasoline" },
  diesel: { factor: 2.68, unit: "liters", label: "Diesel" },
  natural_gas: { factor: 2.75, unit: "kg", label: "Natural Gas (PNG)" },
  bus: { factor: 0.089, unit: "km", label: "Bus Travel" },
  train: { factor: 0.033, unit: "km", label: "Train / Metro" },
  clothing: { factor: 12.5, unit: "items", label: "Clothing Purchased" },
};

export const OCR_CATEGORIES = ["electricity", "petrol", "diesel", "natural_gas", "bus", "train", "clothing"];

export function calculateEmission(type: string, value: number): number {
  const factor = EMISSION_FACTORS[type];
  if (!factor) return 0;
  return parseFloat((value * factor.factor).toFixed(2));
}
