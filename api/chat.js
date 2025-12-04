/* global process */
/**
 * Chat API Endpoint with Rate Limiting
 * Proxies requests to OpenAI API securely
 */

// Simple in-memory rate limiter (resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW;
  
  let entry = rateLimitMap.get(ip);
  if (!entry || entry.windowStart < windowStart) {
    entry = { windowStart: now, count: 0 };
    rateLimitMap.set(ip, entry);
  }
  
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: entry.windowStart + RATE_WINDOW - now };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetIn: entry.windowStart + RATE_WINDOW - now };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const rateCheck = checkRateLimit(ip);
  
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
  res.setHeader('X-RateLimit-Remaining', rateCheck.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(rateCheck.resetIn / 1000));
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      error: 'Too many requests. Please wait before trying again.',
      retryAfter: Math.ceil(rateCheck.resetIn / 1000)
    });
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