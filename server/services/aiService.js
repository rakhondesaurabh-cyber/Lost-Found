import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate tailored ownership verification questions using Gemini AI
 * based on lost/found item details.
 */
export async function generateVerificationQuestions({ title, category, description, location, type }) {
  const prompt = `You are an AI verification assistant for a Lost & Found platform.
An item has been reported:
- Title: ${title || 'Item'}
- Category: ${category || 'General'}
- Public Description: ${description || 'No description given'}
- Location: ${location || 'Campus / Public area'}
- Status: ${type || 'found'}

Generate 1 to 2 sharp, specific ownership verification questions that an honest owner could answer to prove genuine ownership, without giving away secrets in the question itself.
Ask for private unmentioned details (e.g. lock screen wallpaper, case color or stickers, contents or cards inside, brand markings, scratches, keychains, etc.).

Return ONLY a valid JSON array of objects with this structure:
[
  {
    "question": "What is the specific feature/detail?",
    "hint": "Brief hint for claimant"
  }
]
Do not wrap in markdown or backticks. Return raw JSON array only.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API returned error status:', response.status, errText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response from Gemini API');
    }

    // Clean up any potential markdown code fence markers
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((q, idx) => ({
        id: `ai_q_${Date.now()}_${idx}`,
        question: q.question,
        hint: q.hint || 'Provide details to verify ownership',
        isAiGenerated: true
      }));
    }

    throw new Error('Parsed response was not an array');
  } catch (error) {
    console.warn('AI question generation fallback triggered:', error.message);
    
    // Category-aware smart fallbacks if Gemini is unreachable
    const fallbacks = {
      Electronics: [
        {
          id: `fallback_q_1`,
          question: 'What is the lock screen wallpaper or distinctive case/cover on this device?',
          hint: 'Describe the wallpaper image or phone case appearance',
          isAiGenerated: false
        }
      ],
      'Wallets & Purses': [
        {
          id: `fallback_q_1`,
          question: 'Can you name 2 specific cards, IDs, or distinct items inside the wallet/purse?',
          hint: 'Mention specific card issuers or unique items',
          isAiGenerated: false
        }
      ],
      Documents: [
        {
          id: `fallback_q_1`,
          question: 'What is the exact name, roll number, or identifier written on the document/ID?',
          hint: 'Full name or identification digits',
          isAiGenerated: false
        }
      ]
    };

    return fallbacks[category] || [
      {
        id: `fallback_q_1`,
        question: `What is a distinctive feature, mark, brand, or item inside the ${title || 'item'} that wasn't mentioned publicly?`,
        hint: 'Specific colors, stickers, brand logo, or contents',
        isAiGenerated: false
      }
    ];
  }
}
