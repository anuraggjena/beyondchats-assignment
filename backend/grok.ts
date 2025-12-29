import axios from "axios";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

export const generateWithGrok = async (
  original: string,
  ref1: string,
  ref2: string
) => {
  const response = await axios.post(
    GROK_API_URL,
    {
      model: "grok-2",
      messages: [
        {
          role: "system",
          content:
            "You are a professional content editor. Improve the article using the references.",
        },
        {
          role: "user",
          content: `
            Original Article:
            ${original}

            Reference Article 1:
            ${ref1}

            Reference Article 2:
            ${ref2}

            Rewrite the article with better structure, clarity, and SEO.
            Add a References section at the end.
            `,
        },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
};
