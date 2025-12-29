import { Request, Response } from "express";
import { db } from "./db";
import { articles } from "./schema";

export const getArticles = async (_: Request, res: Response) => {
  const data = await db.select().from(articles);
  res.json(data);
};

export const createArticle = async (req: Request, res: Response) => {
  const { title, content, sourceUrl } = req.body;

  await db.insert(articles).values({
    title,
    content,
    sourceUrl,
  });

  res.json({ success: true });
};
