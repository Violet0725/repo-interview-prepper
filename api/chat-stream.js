/**
 * Streaming Chat API Endpoint
 * Proxies requests to OpenAI with Server-Sent Events (SSE) for real-time streaming
 */

export const config = {
  runtime: 'edge', // Use Edge runtime for better streaming support
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Critical: API Key not found in environment variables.");
    return new Response(
      JSON.stringify({ error: 'Server Error: API Key missing.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { messages } = body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        stream: true // Enable streaming
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'OpenAI API Error' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return the stream directly with proper headers for SSE
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Backend Exception:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
