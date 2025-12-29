import { Request, Response } from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { db } from "./db";
import { articles } from "./schema";
import { eq } from "drizzle-orm";
import { searchGoogle } from "./search";
import { generateWithGrok } from "./grok";

const extractMainContent = async (url: string): Promise<string> => {
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });

  const dom = new JSDOM(response.data, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  return article?.textContent || "";
};

const cleanContent = (text: string) => {
  return text
    .replace(/\n{2,}/g, "\n")
    .replace(/\s{2,}/g, " ")
    .replace(/Reply/gi, "")
    .replace(/Comments?/gi, "")
    .trim();
};

export const getArticles = async (_req: Request, res: Response) => {
  const data = await db.select().from(articles);
  res.json(data);
};

export const scrapeAndStoreArticles = async (
  _req: Request,
  res: Response
) => {
  res.json({ success: true });
};

export const enhanceArticle = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, Number(id)));

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    const results = await searchGoogle(article.title);

    const extractedContents: string[] = [];

    for (const r of results) {
      try {
        const raw = await extractMainContent(r.link);
        const cleaned = cleanContent(raw);
        extractedContents.push(cleaned);
      } catch {
        continue;
      }
    }

    const enhancedRaw = await generateWithGrok(
      article.content,
      extractedContents[0] || "",
      extractedContents[1] || ""
    );

    const enhanced = cleanContent(enhancedRaw);

    await db
      .update(articles)
      .set({
        enhancedContent: enhanced,
        references: results.map(r => r.link).join("\n"),
        isUpdated: true,
      })
      .where(eq(articles.id, article.id));

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to enhance article" });
  }
};

export const enhanceAllArticles = async (
  _req: Request,
  res: Response
) => {
  const all = await db.select().from(articles);

  for (const article of all) {
    if (article.isUpdated) continue;

    const results = await searchGoogle(article.title);

    const contents: string[] = [];

    for (const r of results) {
      try {
        const raw = await extractMainContent(r.link);
        contents.push(cleanContent(raw));
      } catch {
        continue;
      }
    }

    const enhanced = cleanContent(
      await generateWithGrok(
        article.content,
        contents[0] || "",
        contents[1] || ""
      )
    );

    await db
      .update(articles)
      .set({
        enhancedContent: enhanced,
        references: results.map(r => r.link).join("\n"),
        isUpdated: true,
      })
      .where(eq(articles.id, article.id));
  }

  res.json({ success: true, message: "All articles enhanced" });
};
