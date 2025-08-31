// src/services/llm.ts
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

// Une seule instance, une seule variable
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function getOpenAI() {
  return openaiClient;
}

export async function chatComplete(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model = process.env.OPENAI_MODEL || "gpt-4o-mini",
): Promise<string> {
  const res = await openaiClient.chat.completions.create({
    model,
    messages,
    temperature: 0.2,
  });
  return res.choices[0]?.message?.content ?? "";
}

export default openaiClient;
