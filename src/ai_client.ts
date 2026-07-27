import Groq from "groq-sdk";

const apiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("Please define the GROQ_KEY environment variable inside .env");
}

const groq = new Groq({ apiKey });

export const MODEL_NAME = "groq/compound";
export const FALLBACK_MODEL_NAME = "groq/compound-mini";

/**
 * Standard text completions wrapper
 */
export async function generateText(
  prompt: string | any[],
  systemInstruction?: string
): Promise<string> {
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }

  if (Array.isArray(prompt)) {
    prompt.forEach((msg: any) => {
      if (msg.role && msg.parts && Array.isArray(msg.parts)) {
        messages.push({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.parts[0]?.text || ""
        });
      } else if (msg.role && msg.content !== undefined) {
        messages.push(msg);
      }
    });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages,
    });
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.warn(`[Groq] generateText failed with model ${MODEL_NAME}, trying fallback ${FALLBACK_MODEL_NAME}. Error:`, error);
    try {
      const completion = await groq.chat.completions.create({
        model: FALLBACK_MODEL_NAME,
        messages,
      });
      return completion.choices[0]?.message?.content || "";
    } catch (fallbackError: any) {
      console.error("[Groq] Fallback model also failed:", fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Structured JSON completions wrapper
 */
export async function generateJson<T>(
  prompt: string | any[],
  systemInstruction?: string
): Promise<T> {
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }

  if (Array.isArray(prompt)) {
    prompt.forEach((msg: any) => {
      if (msg.role && msg.parts && Array.isArray(msg.parts)) {
        messages.push({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.parts[0]?.text || ""
        });
      } else if (msg.role && msg.content !== undefined) {
        messages.push(msg);
      }
    });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  let textResponse = "";
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages,
      response_format: { type: "json_object" }
    });
    textResponse = completion.choices[0]?.message?.content || "{}";
  } catch (error) {
    console.warn(`[Groq] generateJson failed with model ${MODEL_NAME}, trying fallback ${FALLBACK_MODEL_NAME}. Error:`, error);
    try {
      const completion = await groq.chat.completions.create({
        model: FALLBACK_MODEL_NAME,
        messages,
        response_format: { type: "json_object" }
      });
      textResponse = completion.choices[0]?.message?.content || "{}";
    } catch (fallbackError: any) {
      console.error("[Groq] JSON Fallback model also failed:", fallbackError);
      throw fallbackError;
    }
  }

  // Clean Markdown JSON wrapping if the LLM returned it anyway
  let cleanText = textResponse.trim();
  if (cleanText.includes("```json")) {
    cleanText = cleanText.split("```json")[1].split("```")[0].trim();
  } else if (cleanText.includes("```")) {
    cleanText = cleanText.split("```")[1].split("```")[0].trim();
  }

  return JSON.parse(cleanText) as T;
}
