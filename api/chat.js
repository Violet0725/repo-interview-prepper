export default async function handler(req, res) {
  // 1. Only allow POST requests (sending data)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Get the Secret Key from Vercel's Environment Variables
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: OPENAI_API_KEY is missing in Vercel Settings.' });
  }

  try {
    // 3. Forward the request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    // 4. Check for OpenAI errors (like Quota Exceeded)
    if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API Error');
    }

    // 5. Send the answer back to the Frontend
    return res.status(200).json({ content: data.choices[0].message.content });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: error.message });
  }
}