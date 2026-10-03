export function getGroqApiKey() {
  return import.meta.env.VITE_GROQ_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('velociq_groq_api_key') : '') || '';
}

export function setGroqApiKey(key) {
  if (typeof window !== 'undefined') {
    if (key) {
      localStorage.setItem('velociq_groq_api_key', key.trim());
    } else {
      localStorage.removeItem('velociq_groq_api_key');
    }
  }
}

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

/**
 * Build system prompt injecting live telematics context
 */
function buildSystemPrompt(telemetry = {}, activeDTCs = [], vehicleProfile = 'sedan') {
  const dtcSummary = (activeDTCs && activeDTCs.length > 0)
    ? `Active Diagnostic Trouble Codes (DTCs): ${activeDTCs.join(', ')}`
    : 'No active DTC fault codes detected.';

  return `You are VelocIQ AI Copilot — an expert cyber-physical automotive engineering AI and live fleet telematics co-pilot.
You have real-time access to the vehicle's live telemetry, 3D physics engine, OBD-II ECU nodes, and FDI (Fault Detection & Isolation) residuals.

Current Vehicle Live State:
- Vehicle Profile: ${vehicleProfile.toUpperCase()}
- Speed: ${Math.round(telemetry.speed || 0)} km/h (Limit: 90 km/h)
- Engine RPM: ${Math.round(telemetry.rpm || 0)} RPM (Gear: ${telemetry.gear || 'D'}, Drive Mode: ${telemetry.driveMode || 'SPORT'})
- Coolant Temp: ${Math.round(telemetry.coolant || 85)}°C | Oil Temp: ${Math.round(telemetry.oilTemp || 90)}°C | Oil Pressure: ${Math.round(telemetry.oilPressurePsi || 38)} PSI
- Fuel/Battery Level: ${Math.round(telemetry.fuel || 45)}% | MAF: ${(telemetry.maf || 8).toFixed(1)} g/s | Voltage: ${(telemetry.voltage || 13.9).toFixed(1)} V
- Tire Thermals: FL ${Math.round(telemetry.tireTempFL || 35)}°C, FR ${Math.round(telemetry.tireTempFR || 35)}°C
- Brake Rotor Thermals: FL ${Math.round(telemetry.brakeTempFL || 45)}°C, FR ${Math.round(telemetry.brakeTempFR || 45)}°C, RL ${Math.round(telemetry.brakeTempRL || 45)}°C, RR ${Math.round(telemetry.brakeTempRR || 45)}°C
- G-Forces: Lat G: ${Number(telemetry.latG || 0).toFixed(2)} G, Long G: ${Number(telemetry.longG || 0).toFixed(2)} G
- Diagnostic Status: ${dtcSummary}
- Digital Twin Mode: ${telemetry.isRealWorldLive ? 'Active (60Hz Physical 3D Stream)' : 'Standard Real-World Telematics'}

Guidelines:
1. Provide concise, expert, actionable insights with technical automotive precision.
2. If asked about faults/DTCs, explain the root cause, mechanical danger, and recommended technician repair.
3. If asked about performance/efficiency, analyze fuel burn, aerodynamic drag (Cd), and GLOSA green-wave timing.
4. Keep answers friendly, formatted with markdown bullet points and bold highlights when useful.`;
}

/**
 * Send chat message to Groq API
 */
export async function sendGroqChatMessage(messages, telemetry = {}, activeDTCs = [], vehicleProfile = 'sedan') {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return '⚠️ Groq API key is not configured. Please add `VITE_GROQ_API_KEY` to `.env.local` or enter your API key in the Copilot settings.';
  }

  const systemPrompt = buildSystemPrompt(telemetry, activeDTCs, vehicleProfile);

  const payloadMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: payloadMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Fallback to llama-3.1-8b-instant if model error
      if (response.status === 404 || response.status === 400) {
        return sendGroqFallbackMessage(payloadMessages, apiKey);
      }
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response from VelocIQ Copilot.';
  } catch (err) {
    console.error('Groq request failed, trying fast fallback:', err);
    return sendGroqFallbackMessage(payloadMessages, apiKey);
  }
}

async function sendGroqFallbackMessage(payloadMessages, apiKey) {
  const key = apiKey || getGroqApiKey();
  if (!key) {
    return '⚠️ Groq API key is missing. Please configure VITE_GROQ_API_KEY.';
  }
  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: payloadMessages,
        temperature: 0.6,
        max_tokens: 800,
      }),
    });
    if (!res.ok) throw new Error(`Fallback failed: ${res.statusText}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Telemetry analysis complete.';
  } catch (error) {
    return `⚠️ Copilot Notice: Unable to reach Groq API endpoint. Please verify connection. (Error: ${error.message})`;
  }
}
