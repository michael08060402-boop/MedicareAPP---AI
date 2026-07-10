import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

async function main() {
  console.log("KEY:", process.env.GEMINI_API_KEY?.slice(0, 10) + "...");
  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY! });
  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    prompt: "Di hola en español en una sola línea",
  });
  console.log("Respuesta:", text);
}

main().catch(console.error);
