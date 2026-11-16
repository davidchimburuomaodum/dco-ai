import OpenAI from "openai";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const INSTRUCTIONS = `
You are DCO AI, a general-purpose AI assistant developed by DCO Cyber Solutions.

Help with general knowledge, education, writing, programming, research,
business, productivity, creative work, and defensive cybersecurity.

Be helpful, accurate, professional, and respectful.
Explain complex topics clearly.
Never pretend to perform actions you have not performed.
Admit uncertainty when information is unavailable.
`;

export async function generateReply(messages) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Groq API key is not configured.");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("A conversation message is required.");
  }

  const input = messages.slice(-20).map((message) => {
    if (!["user", "assistant"].includes(message.role)) {
      throw new Error("Invalid conversation role.");
    }

    if (
      typeof message.content !== "string" ||
      !message.content.trim() ||
      message.content.length > 6000
    ) {
      throw new Error("Invalid message content.");
    }

    return {
      role: message.role,
      content: message.content.trim()
    };
  });

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1"
  });

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: INSTRUCTIONS
      },
      ...input
    ],
    max_tokens: 1200
  });

  return response.choices[0]?.message?.content || "I couldn't generate a response.";
}
