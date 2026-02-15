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
    const diurnalRange = avgMax - avgMin; // large range = dry, small range = humid

    // Also fetch humidity data for better classification
    const humidityUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=relative_humidity_2m_mean&timezone=auto&past_days=30&forecast_days=0`;
    let avgHumidity = 60; // default
    try {
      const humRes = await fetch(humidityUrl);
      const humData = await humRes.json();
      if (humData?.daily?.relative_humidity_2m_mean) {
        const humVals: number[] = humData.daily.relative_humidity_2m_mean;
        avgHumidity = humVals.reduce((a: number, b: number) => a + b, 0) / humVals.length;
      }
    } catch {
      // fallback: use diurnal range as humidity proxy
      avgHumidity = diurnalRange < 10 ? 75 : 45;
    }

    // Classify climate zone for India
    let climateZone = "moderate";
    let label = "";
    if (avgTemp < 15) {
      climateZone = "cold";
      label = "Cold";
    } else if (avgTemp >= 30 && avgHumidity < 50) {
      climateZone = "hot_dry";
      label = "Hot & Dry";
    } else if (avgTemp >= 22 && avgHumidity >= 50) {
      climateZone = "warm_humid";
      label = "Warm & Humid";
    } else {
      climateZone = "moderate";
      label = "Moderate";
    }

    return new Response(
      JSON.stringify({
        climateZone,
        label,
        avgTemp: parseFloat(avgTemp.toFixed(1)),
        avgHumidity: parseFloat(avgHumidity.toFixed(1)),
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
