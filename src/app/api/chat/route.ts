import { createGroq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages } from "ai";
import { auth } from "@/lib/auth";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! });

const SYSTEM_PROMPTS = {
  patient: `Eres un asistente de salud de MediCare AI. Ayudas a pacientes a entender sus síntomas
y orientarlos sobre si necesitan atención médica.
- Responde siempre en español, de forma clara y empática.
- Nunca diagnostiques enfermedades ni recetes medicamentos.
- Si los síntomas son graves (dolor en el pecho, dificultad para respirar, pérdida de consciencia),
  indica urgentemente que llame al 911 o vaya a urgencias.
- Sugiere qué tipo de especialista podría necesitar según los síntomas.
- Sé conciso, máximo 3-4 oraciones por respuesta.`,

  doctor: `Eres un asistente médico clínico de MediCare AI para profesionales de la salud.
- Responde siempre en español, con lenguaje técnico médico apropiado.
- Ayudas a sugerir diagnósticos diferenciales y opciones de tratamiento basados en síntomas.
- Puedes sugerir medicamentos comunes con dosis estándar como referencia.
- Recuerda que el médico tiene la decisión final — tus sugerencias son de apoyo, no prescripciones definitivas.
- Sé conciso y estructurado.`,
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { messages, mode } = body;
    const role = (mode as keyof typeof SYSTEM_PROMPTS) ?? "patient";

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPTS[role] ?? SYSTEM_PROMPTS.patient,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[/api/chat] error:", err);
    return new Response(String(err), { status: 500 });
  }
}
