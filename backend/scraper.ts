import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { db } from "./db";
import { articles } from "./schema";
import { eq } from "drizzle-orm";

export async function scrapeOldestBlogs() {
  let url = "https://beyondchats.com/blogs";
  const allLinks: string[] = [];

  // walk through pagination using older posts
  while (url) {
    const res = await axios.get(url);
    const dom = new JSDOM(res.data);
    const doc = dom.window.document;

    const links = [...doc.querySelectorAll("a")]
      .map(a => a.href)
      .filter(h => h.includes("/blogs/") && !h.includes("/page/"));

    for (const link of links) {
      if (!allLinks.includes(link)) {
        allLinks.push(link);
      }
    }

    // find older posts link
    const next = doc.querySelector("a.next");

    if (!next) break;
    url = next.getAttribute("href")!;
  }

  // take the last 5 = oldest
  const oldestFive = allLinks.slice(-5);

  let inserted = 0;

  for (const link of oldestFive) {
    const exists = await db
      .select()
      .from(articles)
      .where(eq(articles.sourceUrl, link));

    if (exists.length) continue;

    const html = await axios.get(link);
    const dom = new JSDOM(html.data, { url: link });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.title || !article?.textContent) continue;

    await db.insert(articles).values({
      title: article.title.trim(),
      content: article.textContent.trim(),
      sourceUrl: link,
      isUpdated: false,
    });

    inserted++;
  }

  return {
    success: true,
    inserted,
  };
}
