import axios from "axios";
import * as cheerio from "cheerio";
import { db } from "./db";
import { articles } from "./schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://beyondchats.com";

export async function scrapeOldestBlogs() {
  let url = `${BASE_URL}/blogs`;
  const allLinks: string[] = [];

  // crawl pagination
  while (url) {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (
        href &&
        href.includes("/blogs/") &&
        !href.includes("/page/") &&
        !href.includes("#")
      ) {
        const full = href.startsWith("http")
          ? href
          : `${BASE_URL}${href}`;

        if (!allLinks.includes(full)) {
          allLinks.push(full);
        }
      }
    });

    const next = $("a.next").attr("href");
    if (!next) break;

    url = next.startsWith("http") ? next : `${BASE_URL}${next}`;
  }

  // oldest 5 posts
  const oldestFive = allLinks.slice(-5);

  let inserted = 0;

  for (const link of oldestFive) {
    const exists = await db
      .select()
      .from(articles)
      .where(eq(articles.sourceUrl, link));

    if (exists.length) continue;

    const page = await axios.get(link);
    const $ = cheerio.load(page.data);

    const title =
      $("h1").first().text().trim() ||
      link.split("/").pop()?.replace(/-/g, " ") ||
      "Untitled Article";

    let content = "";

    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 40) {
        content += text + "\n\n";
      }
    });

    if (content.length < 300) continue;

    await db.insert(articles).values({
      title,
      content,
      sourceUrl: link,
      isUpdated: false,
    });

    inserted++;
  }

  return { success: true, inserted };
}
