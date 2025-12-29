import axios from "axios";
import * as cheerio from "cheerio";

export const scrapeOldestBlogs = async () => {
  const url = "https://beyondchats.com/blogs/";
  const { data } = await axios.get(url);

  const $ = cheerio.load(data);

  const articles: {
    title: string;
    content: string;
    sourceUrl: string;
  }[] = [];

  const blogCards = $("article").slice(-5);

  console.log("Blog cards found:", $("article").length);

  for (const el of blogCards.toArray()) {
    const title = $(el).find("h2, h3").first().text().trim();
    const link = $(el).find("a").attr("href");

    if (!title || !link) continue;

    const articleUrl = link.startsWith("http")
      ? link
      : `https://beyondchats.com${link}`;

    const articleRes = await axios.get(articleUrl);
    const articlePage = cheerio.load(articleRes.data);

    const content = articlePage("article").text().trim();

    articles.push({
      title,
      content,
      sourceUrl: articleUrl,
    });
  }

  return articles;
};
