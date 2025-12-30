import { Request, Response } from "express";
import { db } from "./db";
import { articles } from "./schema";
import { eq } from "drizzle-orm";
import { scrapeOldestBlogs } from "./scraper";
import { generateWithGroq } from "./groq";
import { scraperState } from "./scraperState";

export const getArticles = async (_: Request, res: Response) => {
  const data = await db.select().from(articles);
  res.json(data);
};

export const getStatus = async (_: Request, res: Response) => {
  const rows = await db.select().from(articles);
  res.json({ 
    scraping: scraperState.isScraping,
    articleCount: rows.length
  });
};

export const scrapeAndStoreArticles = async () => {
  await scrapeOldestBlogs();
};

export const enhanceArticle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    const enhanced = await generateWithGroq(
      article.content,
      article.title,
      article.sourceUrl || ""
    );

    await db
      .update(articles)
      .set({
        enhancedContent: enhanced,
        isUpdated: true,
      })
      .where(eq(articles.id, id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Enhancement failed" });
  }
};
