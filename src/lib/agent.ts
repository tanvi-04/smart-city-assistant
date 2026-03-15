import { GoogleGenerativeAI } from "@google/generative-ai";
import { getBusArrivals, getTrainArrivals, getServiceAlerts } from "./cta-api";
import { generateForecast } from "./transit-utils";
import { estimateUberFare } from "./rideshare-utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const tools = [
  {
    name: "getBusArrivals",
    description: "Get real-time bus arrival predictions. IMPORTANT: Specify a CTA Stop ID. Always filter results to match the user's requested route/line.",
    parameters: {
      type: "object",
      properties: {
        stpid: { type: "string", description: "The CTA stop ID." },
      },
      required: ["stpid"],
    },
  },
  {
    name: "getTrainArrivals",
    description: "Get real-time train arrival predictions. IMPORTANT: Specify a CTA Station/Map ID. Always filter results to match the user's requested color line (e.g. Green, Blue).",
    parameters: {
      type: "object",
      properties: {
        mapid: { type: "string", description: "The CTA station map ID." },
      },
      required: ["mapid"],
    },
  },
  {
    name: "getServiceAlerts",
    description: "Get active service alerts for CTA routes (e.g., 'Red', '66').",
    parameters: {
      type: "object",
      properties: {
        route: { type: "string", description: "Optional route ID to filter alerts." },
      },
    },
  },
  {
    name: "getCommuteForecast",
    description: "Analyze transit patterns and provide a 'Smart Commute Forecast' to suggest the best time to leave based on vehicle bunching and gaps. Use this when users ask for the 'best time/moment to leave' or optimal window.",
    parameters: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["bus", "train"], description: "The type of transit." },
        id: { type: "string", description: "The CTA Stop ID (for bus) or Map ID (for train)." },
      },
      required: ["type", "id"],
    },
  },
  {
    name: "estimateUberFare",
    description: "Get simulated Uber fare estimates between major Chicago locations. Use this when users ask for Uber prices, rideshare costs, or 'how much an Uber would be'. Mention these are approximate simulated estimates.",
    parameters: {
      type: "object",
      properties: {
        from: { type: "string", description: "The starting location (e.g., Union Station, O'Hare)." },
        to: { type: "string", description: "The destination location (e.g., Navy Pier)." },
      },
      required: ["from", "to"],
    },
  },
];

export async function chatWithAssistant(message: string, history: any[] = []) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    return { text: "Missing GEMINI_API_KEY. Please add your actual API key from Google AI Studio to the .env.local file." };
  }

  // Model selection with fallback
  // If gemini-1.5-flash fails, we could try others, but usually 1.5-flash is the most available.
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    tools: [{ functionDeclarations: tools as any }]
  });

  const chat = model.startChat({
    history: history,
  });

  // Prepend formatting instruction to ensure "pointwise" response and persona
  const enhancedMessage = `[SYSTEM: You are the 'SmartCity Assistant', a high-intelligence AI agent operating in a Tech-Noir version of Chicago. 
  1. Always provide information in a clear, pointwise (bulleted) format. 
  2. Be extremely precise with transit timings.
  3. When asked for the best time to leave or commute status, ALWAYS use 'getCommuteForecast' and present the results as a 'SMART COMMUTE FORECAST' section in your response.
  4. When asked about Uber fares or rideshare costs, ALWAYS use 'estimateUberFare' and present the results as an 'UBER FARE ESTIMATE' section. Label these as 'AI-Simulated Estimates'.
  5. Use a professional, slightly futuristic, helpful tone.] ${message}`;

  try {
    let result = await chat.sendMessage(enhancedMessage);
    let response = result.response;
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
      const calls = response.functionCalls();
      if (!calls || calls.length === 0) break;

      console.log(`Agent iteration ${iterations + 1}: triggered tool calls:`, calls.map(c => c.name));
      const toolResults: any = {};

      for (const call of calls) {
        try {
          if (call.name === "getBusArrivals") {
            toolResults[call.name] = await getBusArrivals((call.args as any).stpid);
          } else if (call.name === "getTrainArrivals") {
            toolResults[call.name] = await getTrainArrivals((call.args as any).mapid);
          } else if (call.name === "getServiceAlerts") {
            toolResults[call.name] = await getServiceAlerts((call.args as any).route);
          } else if (call.name === "getCommuteForecast") {
            const { type, id } = call.args as any;
            const arrivals = type === 'bus' ? await getBusArrivals(id) : await getTrainArrivals(id);
            const alerts = await getServiceAlerts();
            toolResults[call.name] = generateForecast(arrivals, alerts);
          } else if (call.name === "estimateUberFare") {
            const { from, to } = call.args as any;
            toolResults[call.name] = estimateUberFare(from, to);
          }
        } catch (toolErr) {
          console.error(`Tool ${call.name} failed:`, toolErr);
          toolResults[call.name] = { error: "Failed to fetch real-time data from CTA." };
        }
      }

      const toolPart = Object.entries(toolResults).map(([name, data]) => ({
        functionResponse: {
          name,
          response: { content: data }
        }
      }));

      result = await chat.sendMessage(toolPart);
      response = result.response;
      iterations++;
    }

    let text = "";
    try {
      text = response.text();
    } catch (e) {
      // Fallback if text extraction fails (e.g. only tool calls present in current turn but no text)
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        text = candidate.content.parts
          .filter(part => part.text)
          .map(part => part.text)
          .join("\n");
      }
    }

    if (!text.trim()) {
      text = "I'm still processing your request. Could you please specify a CTA Stop ID or more details about your location?";
    }

    return {
      text: text,
      history: await chat.getHistory()
    };
  } catch (error: any) {
    console.error("Gemini API Error Detail:", {
      message: error.message,
      status: error.status,
      details: error.details,
      stack: error.stack
    });

    if (error.message.includes("404")) {
      return { text: "Error: The AI model could not be found. This usually means either the API Key is invalid, the model is not available in your region, or your account doesn't have access to this specific version. Please ensure you created the key at aistudio.google.com and check your configuration." };
    }

    if (error.message.includes("429")) {
      return { text: "Error: Quota exceeded. Your API key has hit its usage limit (likely the 15 Requests Per Minute limit for the Gemini free tier). Since the assistant performs multiple 'thinking' steps to fetch real-time data, you may hit this limit quickly. Please wait a minute and try again, or check your settings at aistudio.google.com." };
    }

    return { text: `Error: ${error.message}. Please check your server logs for more details.` };
  }
}

export function predictDelay(arrivals: any[], alerts: any[]): string {
  const hasDelay = arrivals.some(a => a.delay);
  const relevantAlerts = alerts.filter(alert => alert.SeverityScore > 50);

  if (hasDelay) return "High: Real-time data confirms a delay.";
  if (relevantAlerts.length > 0) return `Medium: Service alerts reported: ${relevantAlerts[0].Headline}`;
  return "Low: No current delays reported.";
}
