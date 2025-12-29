import { Request, Response } from "express";
import { db } from "./db";
import { articles } from "./schema";
import { scrapeOldestBlogs } from "./scraper";
import { eq } from "drizzle-orm";

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
