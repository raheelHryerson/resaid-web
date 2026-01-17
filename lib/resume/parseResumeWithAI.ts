import fetch from 'node-fetch';

/**
 * Calls OpenAI to extract structured resume data from raw text.
 * @param {string} text - The raw resume text
 * @returns {Promise<any>} - The structured resume object
 */
export async function parseResumeWithAI(text: string): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY in environment');

  // Log the raw extracted text for debugging
  console.log('[AI PARSER] Raw extracted text:', text);

  const prompt = `Extract the following information from this resume text. Return a valid JSON object with these fields: name, email, phone, location, skills (array), experience (array of objects with title, company, startDate, endDate, bullets), education (array of objects with degree, school, year, field).\n\nResume text:\n"""\n${text}\n"""`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful resume parser.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1024,
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  // Log the raw AI response for debugging
  console.log('[AI PARSER] Raw AI response:', content);

  // Remove Markdown code block markers if present
  let cleanContent = content;
  if (cleanContent) {
    cleanContent = cleanContent.replace(/^```json\s*|^```\s*|```$/gm, '').trim();
  }

  try {
    return JSON.parse(cleanContent);
  } catch {
    return null;
  }
}
