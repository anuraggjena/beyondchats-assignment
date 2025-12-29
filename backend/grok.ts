import axios from "axios";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_API_KEY = process.env.GROK_API_KEY!;

/**
 * Generate enhanced article using Grok
 */
export const generateWithGrok = async (
  original: string,
  ref1: string,
  ref2: string
): Promise<string> => {
  const prompt = `
You are an expert technical content writer.

Rewrite the following article in **clean, structured Markdown**.

Rules:
- Use proper headings (##, ###)
- Keep paragraphs short and readable
- Use bullet points where helpful
- DO NOT repeat the title
- DO NOT include HTML
- DO NOT include emojis
- Do NOT add fluff
- Make it professional and informative
- Improve clarity and flow
- Keep content factual

Structure strictly like this:

## Introduction
<short intro>

## Key Insights
- bullet point
- bullet point
- bullet point

## Challenges
<short paragraphs>

## Practical Takeaways
- bullet point
- bullet point

## Conclusion
<closing paragraph>

Original Article:
${original}

Reference Material:
${ref1}
${ref2}
`;

  const response = await axios.post(
    GROK_API_URL,
    {
      model: "grok-2-latest",
      messages: [
        {
          role: "system",
          content:
            "You are a professional content editor who writes clean, structured, well-formatted articles.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    },
    {
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
};
