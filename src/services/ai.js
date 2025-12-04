/**
 * AI Service
 * Handles all interactions with the OpenAI API via our backend proxy
 */

const API_ENDPOINT = '/api/chat';

/**
 * Build the prompt for question generation
 * @param {string} readme - README content
 * @param {string} code - Code context
 * @param {string} resumeText - Optional resume context
 * @param {string} questionType - Type of questions to generate
 */
const buildQuestionPrompt = (readme, code, resumeText, questionType) => {
  let typePrompt = "";
  if (questionType === 'technical') {
    typePrompt = "Generate ONLY technical questions. Focus on code logic, complexity, design patterns, and library choices.";
  } else if (questionType === 'behavioral') {
    typePrompt = "Generate ONLY behavioral questions using the STAR method. Ask about challenges faced, prioritization, and conflict resolution.";
  } else {
    typePrompt = "Generate a mix of 2 Technical, 2 Architectural, and 2 Behavioral questions.";
  }

  return `
    Act as a Senior Technical Interviewer. 
    
    CONTEXT:
    1. README SUMMARY: ${readme ? readme.slice(0, 2000) : "N/A"}
    2. SELECTED CODE SNIPPETS: ${code ? code : "No specific code files selected."}
    3. CANDIDATE RESUME/CONTEXT: ${resumeText ? resumeText.slice(0, 1000) : "N/A"}

    TASK:
    Generate a JSON object with interview content based on this constraint: ${typePrompt}
    
    Structure:
    {
      "project_summary": "Technical summary of the repo.",
      "tech_stack": ["Tech1", "Tech2"],
      "questions": [
        {
          "category": "Architecture" | "Technical" | "Behavioral",
          "q": "The question",
          "strategy": "A brief 1-2 sentence hint on what direction the answer should take.",
          "sample_answer": "A complete, impressive, first-person 'Perfect Answer' that the candidate can study.",
          "difficulty": "Junior" | "Mid" | "Senior"
        }
      ]
    }
    
    Generate exactly 6 questions. 
  `;
};

/**
 * Generate interview questions (non-streaming)
 * @param {string} readme - README content
 * @param {string} code - Code context
 * @param {string} resumeText - Optional resume context
 * @param {string} questionType - Type of questions
 */
export const generateQuestions = async (readme, code, resumeText, questionType) => {
  const prompt = buildQuestionPrompt(readme, code, resumeText, questionType);

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "You output only valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    let errorMsg = "Unknown Error";
    try {
      const errData = await response.json();
      errorMsg = errData.error || response.statusText;
    } catch {
      errorMsg = `Server Error: ${response.status}`;
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (data.content) {
    const jsonStr = data.content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  }
  return data;
};

/**
 * Evaluate answer with streaming response
 * @param {string} question - The interview question
 * @param {string} idealAnswer - The ideal answer
 * @param {string} userAnswer - The user's answer
 * @param {function} onChunk - Callback for each streamed chunk
 * @param {AbortSignal} signal - Optional abort signal
 */
export const evaluateAnswerStreaming = async (question, idealAnswer, userAnswer, onChunk, signal) => {
  const response = await fetch('/api/chat-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { 
          role: "system", 
          content: "You are an interviewer. Grade the candidate's answer based on the ideal answer. Be constructive but brief. Use markdown formatting for clarity." 
        },
        { 
          role: "user", 
          content: `Question: ${question}\nIdeal Logic: ${idealAnswer}\nCandidate Answer: ${userAnswer}\n\nProvide feedback.` 
        }
      ]
    }),
    signal
  });

  if (!response.ok) {
    throw new Error(`Stream error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk(content, fullContent);
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  }

  return fullContent;
};

/**
 * Evaluate answer (non-streaming fallback)
 * @param {string} question - The interview question
 * @param {string} idealAnswer - The ideal answer
 * @param {string} userAnswer - The user's answer
 */
export const evaluateAnswer = async (question, idealAnswer, userAnswer) => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { 
          role: "system", 
          content: "You are an interviewer. Grade the candidate's answer based on the ideal answer. Be constructive but brief." 
        },
        { 
          role: "user", 
          content: `Question: ${question}\nIdeal Logic: ${idealAnswer}\nCandidate Answer: ${userAnswer}\n\nProvide feedback.` 
        }
      ]
    })
  });

  const data = await response.json();
  return data.content;
};
