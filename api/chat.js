const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Groq retires models over time. If you get a "model not found" error,
// check https://console.groq.com/docs/models and update this name.
const MODEL = "openai/gpt-oss-20b";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;
const ALLOWED_ROLES = ["user", "assistant"];

const SYSTEM_PROMPT =
  "You are a friendly, helpful AI assistant for beginners. " +
  "Give clear, simple answers.";

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // 2. Read the API key from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Server is missing GROQ_API_KEY. Check your setup." });
  }

  // 3. Read the request body (Vercel usually parses JSON for us)
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON in request." });
    }
  }

  // 4. Validate the messages
  const messages = body && body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res
      .status(400)
      .json({ error: "Please send a non-empty 'messages' array." });
  }

  const cleanMessages = [];
  for (const msg of messages.slice(-MAX_MESSAGES)) {
    if (
      !msg ||
      !ALLOWED_ROLES.includes(msg.role) ||
      typeof msg.content !== "string" ||
      msg.content.trim() === ""
    ) {
      return res.status(400).json({
        error: "Each message needs a role (user/assistant) and text content.",
      });
    }
    if (msg.content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({
        error: `Messages must be under ${MAX_CONTENT_LENGTH} characters.`,
      });
    }
    cleanMessages.push({ role: msg.role, content: msg.content });
  }

  // 5. Call the Groq API
  try {
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleanMessages],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!groqResponse.ok) {
      const details = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, details);

      if (groqResponse.status === 401) {
        return res.status(500).json({ error: "Invalid Groq API key." });
      }
      if (groqResponse.status === 429) {
        return res
          .status(429)
          .json({ error: "Too many requests. Please wait and try again." });
      }
      return res
        .status(502)
        .json({ error: "The AI service returned an error. Try again." });
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({ error: "The AI sent an empty reply." });
    }

    // 6. Send the answer back to the frontend
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Something went wrong on the server." });
  }
}