import { Request, Response } from "express";
import { db } from "./db";
import { articles } from "./schema";
import { scrapeOldestBlogs } from "./scraper";
import { eq } from "drizzle-orm";
import { generateWithGrok } from "./grok";
import { searchGoogle } from "./search";
import axios from "axios";
import * as cheerio from "cheerio";

export const getArticles = async (_: Request, res: Response) => {
  const data = await db.select().from(articles);
  res.json(data);
};

export const scrapeAndStoreArticles = async (_: Request, res: Response) => {
  const scraped = await scrapeOldestBlogs();

  for (const item of scraped) {
    const existing = await db
      .select()
      .from(articles)
      .where(eq(articles.sourceUrl, item.sourceUrl));

    if (existing.length === 0) {
      await db.insert(articles).values({
        title: item.title,
        content: item.content,
        sourceUrl: item.sourceUrl,
        isUpdated: false,
      });
    }
  }

  res.json({
    success: true,
    inserted: scraped.length,
  });
};

export const enhanceArticle = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, Number(id)));

  if (!article) return res.status(404).json({ error: "Not found" });

  const results = await searchGoogle(article.title);

  const contents: string[] = [];

  for (const r of results) {
    const html = await axios.get(r.link);
    const $ = cheerio.load(html.data);
    contents.push($("article").text());
  }

  const enhanced = await generateWithGrok(
    article.content,
    contents[0],
    contents[1]
  );

  await db
    .update(articles)
    .set({
      enhancedContent: enhanced,
      references: results.map(r => r.link).join("\n"),
      isUpdated: true,
    })
    .where(eq(articles.id, article.id));

  res.json({ success: true });
};