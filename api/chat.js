import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  // Allow the public GitHub Pages frontend to call this API.
  res.setHeader("Access-Control-Allow-Origin", "https://matthewmor225.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: "ANTHROPIC_API_KEY is not configured."
      });
    }

    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages
      : [];

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const out = await client.messages.create({
      model: process.env.NOVA_MODEL || "claude-sonnet-5",
      max_tokens: 4096,
      system:
        "You are Nova, a friendly and capable AI assistant. Be clear, helpful and honest. Help with coding, computers, games, creative projects and general questions. Do not claim to be ChatGPT. You are powered by Claude.",
      messages: messages.slice(-40)
    });

    const reply = (out.content || [])
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("");

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error?.message || "Claude request failed."
    });
  }
}
