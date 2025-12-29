import axios from "axios";
import cheerio from "cheerio";

export const scrapeOldestBlogs = async () => {
  const url = "https://beyondchats.com/blogs";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const articles: {
    title: string;
    sourceUrl: string;
  }[] = [];

  $(".blog-card")
    .slice(-5)
    .each((_, el) => {
      const title = $(el).find("h3").text().trim();
      const link = $(el).find("a").attr("href");

      if (title && link) {
        articles.push({
          title,
          sourceUrl: `https://beyondchats.com${link}`,
        });
      }
    });

  return articles;
};
