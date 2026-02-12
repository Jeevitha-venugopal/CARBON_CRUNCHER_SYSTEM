// Carbon emission factors (kg CO₂ per unit)
export const EMISSION_FACTORS: Record<string, { factor: number; unit: string; label: string }> = {
  electricity: { factor: 0.85, unit: "kWh", label: "Electricity" },
  petrol: { factor: 2.31, unit: "liters", label: "Petrol / Gasoline" },
  diesel: { factor: 2.68, unit: "liters", label: "Diesel" },
  natural_gas: { factor: 2.0, unit: "m³", label: "Natural Gas" },
  bus: { factor: 0.089, unit: "km", label: "Bus Travel" },
  train: { factor: 0.041, unit: "km", label: "Train Travel" },
  flight_short: { factor: 0.255, unit: "km", label: "Short Flight (<1500km)" },
  flight_long: { factor: 0.195, unit: "km", label: "Long Flight (>1500km)" },
  car: { factor: 0.21, unit: "km", label: "Car Travel" },
  meat: { factor: 7.0, unit: "kg", label: "Meat Consumption" },
  dairy: { factor: 3.2, unit: "kg", label: "Dairy Products" },
  vegetables: { factor: 0.5, unit: "kg", label: "Vegetables / Fruits" },
  processed_food: { factor: 3.5, unit: "kg", label: "Processed Food" },
  clothing: { factor: 15.0, unit: "items", label: "Clothing Purchased" },
  waste_general: { factor: 0.5, unit: "kg", label: "General Waste" },
  waste_recycled: { factor: 0.02, unit: "kg", label: "Recycled Waste" },
  water: { factor: 0.0003, unit: "liters", label: "Water Usage" },
};

export const CATEGORIES = {
  electricity: ["electricity", "natural_gas"],
  transportation: ["petrol", "diesel", "bus", "train", "flight_short", "flight_long", "car"],
  food: ["meat", "dairy", "vegetables", "processed_food"],
  clothing: ["clothing"],
  waste: ["waste_general", "waste_recycled"],
  water: ["water"],
};

export const CATEGORY_LABELS: Record<string, string> = {
  electricity: "🔌 Electricity & Energy",
  transportation: "🚗 Transportation",
  food: "🍽️ Food",
  clothing: "👕 Clothing",
  waste: "🗑️ Waste",
  water: "💧 Water",
};

// OCR-eligible categories (bill-based)
export const OCR_CATEGORIES = ["electricity", "petrol", "diesel", "natural_gas", "bus", "train", "clothing"];

export const MONTHLY_LIMIT_KG = 480;

export function calculateEmission(type: string, value: number): number {
  const factor = EMISSION_FACTORS[type];
  if (!factor) return 0;
  return parseFloat((value * factor.factor).toFixed(2));
}

export function getRecommendations(emissions: { category: string; amount: number }[]): string[] {
  const byCategory: Record<string, number> = {};
  emissions.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const tips: string[] = [];
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  for (const [cat] of sorted.slice(0, 3)) {
    if (["electricity", "natural_gas"].includes(cat)) {
      tips.push("💡 Switch to LED lighting and solar panels to cut energy emissions");
    } else if (["petrol", "diesel", "car"].includes(cat)) {
      tips.push("🚌 Use public transport or carpool to reduce fuel emissions");
    } else if (["flight_short", "flight_long"].includes(cat)) {
      tips.push("✈️ Consider trains for shorter trips and offset longer flights");
    } else if (["meat", "dairy"].includes(cat)) {
      tips.push("🥬 Try plant-based meals a few days a week to lower food emissions");
    } else if (cat === "clothing") {
      tips.push("♻️ Buy second-hand clothing and repair items to reduce textile waste");
    } else if (["waste_general"].includes(cat)) {
      tips.push("🗑️ Compost organic waste and increase recycling to reduce landfill emissions");
    } else if (cat === "water") {
      tips.push("💧 Install low-flow fixtures and take shorter showers");
    }
  }

  if (tips.length === 0) {
    tips.push("🌱 Great job! Keep tracking to maintain your low carbon footprint");
  }

  return [...new Set(tips)];
}
