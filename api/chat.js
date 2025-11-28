export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. DEBUGGING: Log if key exists (don't log the full key for safety)
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("--- DEBUG LOG ---");
  console.log("Request received.");
  console.log("API Key Status:", apiKey ? "Loaded (Length: " + apiKey.length + ")" : "MISSING/UNDEFINED");

  if (!apiKey) {
    console.error("Critical: API Key not found in environment variables.");
    return res.status(500).json({ error: 'Server Error: API Key missing. Did you restart the server?' });
  }

  try {
    // 3. Forward the request to OpenAI
    console.log("Sending request to OpenAI...");
    
    // EXTRACT messages specifically to avoid overwriting the model
    const { messages } = req.body;

    const payload = {
      model: "gpt-4o-mini", // Forced to the fastest model
      messages: messages,
      temperature: 0.7,
      // NATIVE JSON MODE: This significantly improves speed and reliability for data generation
      response_format: { type: "json_object" }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // 4. Check for OpenAI errors
    if (!response.ok) {
        console.error("OpenAI API Error:", data); // This prints the exact error from OpenAI
        throw new Error(data.error?.message || 'OpenAI API Error');
    }

    console.log("Success! Sending response to frontend.");
    return res.status(200).json({ content: data.choices[0].message.content });

  } catch (error) {
    console.error("Backend Exception:", error.message);
    return res.status(500).json({ error: error.message });
  }
}