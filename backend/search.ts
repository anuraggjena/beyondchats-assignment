import axios from "axios";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export const searchGoogle = async (
  query: string): Promise<SearchResult[]> => {
  const response = await axios.post(
    "https://google.serper.dev/search",
    { q: query, num: 2 },
    {
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.organic.map((item: any) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet || "",
  }));
};
