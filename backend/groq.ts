import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export const generateWithGroq = async (
  original: string,
  ref1?: string,
  ref2?: string
): Promise<string> => {
  const prompt = `
You are an expert technical content writer.

Rewrite the following article in clean, structured Markdown.

Rules:
- Use proper headings (##, ###)
- Keep paragraphs short and readable
- Use bullet points where helpful
- DO NOT repeat the title
- DO NOT include HTML
- DO NOT include emojis
- Keep it professional and factual
- Improve clarity and flow

Structure strictly like this:

## Introduction
<short intro>

## Key Insights
- bullet point
- bullet point
- bullet point

## Challenges
<short paragraph>

## Practical Takeaways
- bullet point
- bullet point

## Conclusion
<closing paragraph>

Original Article:
${original}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a professional editor improving technical blog articles.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  return completion.choices[0].message.content || "";
};
