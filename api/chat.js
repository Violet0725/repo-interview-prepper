export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Critical: API Key not found in environment variables.");
    return res.status(500).json({ error: 'Server Error: API Key missing. Did you restart the server?' });
  }

  try {
    const { messages, response_format } = req.body;

    const payload = {
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      // Only use JSON mode if the frontend specifically asks for it
      response_format: response_format || undefined
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
    
    if (!response.ok) {
        console.error("OpenAI API Error:", data);
        throw new Error(data.error?.message || 'OpenAI API Error');
    }

    return res.status(200).json({ content: data.choices[0].message.content });

  } catch (error) {
    console.error("Backend Exception:", error.message);
    return res.status(500).json({ error: error.message });
  }
}