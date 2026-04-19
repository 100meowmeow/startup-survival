// netlify/functions/claude-proxy.js
//
// Proxies requests to the Anthropic API so the API key never touches the client.
//
// Deploy this file to:  netlify/functions/claude-proxy.js
// (relative to your project root, next to netlify.toml)
//
// Set ANTHROPIC_API_KEY in Netlify → Site settings → Environment variables.
//
// Expected request body: { system: string, messages: [{role, content}] }
// Returns Anthropic /v1/messages response JSON directly.

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY not set in environment variables." }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { system, messages, model = "claude-sonnet-4-20250514", max_tokens = 1024 } = body;

  if (!messages || !Array.isArray(messages)) {
    return { statusCode: 400, body: JSON.stringify({ error: "messages array required" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens,
        ...(system ? { system } : {}),
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || "Anthropic API error" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Proxy error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal proxy error", detail: err.message }),
    };
  }
};