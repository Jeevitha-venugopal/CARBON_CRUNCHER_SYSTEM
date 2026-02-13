import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "lat and lon required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Open-Meteo free API (no API key needed) to get avg temperature
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto&past_days=30&forecast_days=0`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.daily) {
      return new Response(JSON.stringify({ error: "Weather API error", details: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const maxTemps: number[] = data.daily.temperature_2m_max || [];
    const minTemps: number[] = data.daily.temperature_2m_min || [];
    const avgMax = maxTemps.reduce((a: number, b: number) => a + b, 0) / maxTemps.length;
    const avgMin = minTemps.reduce((a: number, b: number) => a + b, 0) / minTemps.length;
    const avgTemp = (avgMax + avgMin) / 2;
    const avgHumidity = avgMax - avgMin; // proxy: large diurnal range = dry

    // Classify climate zone for India
    let climateZone = "moderate";
    if (avgTemp > 30 && avgHumidity > 12) {
      climateZone = "hot_dry"; // Hot & Dry
    } else if (avgTemp > 25 && avgHumidity <= 12) {
      climateZone = "warm_humid"; // Warm & Humid (low diurnal range = humid)
    } else if (avgTemp < 15) {
      climateZone = "cold"; // Cold
    } else {
      climateZone = "moderate"; // Moderate
    }

    return new Response(
      JSON.stringify({
        climateZone,
        avgTemp: parseFloat(avgTemp.toFixed(1)),
        location: { lat, lon },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
