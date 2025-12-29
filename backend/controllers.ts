import { Request, Response } from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { db } from "./db";
import { articles } from "./schema";
import { eq } from "drizzle-orm";
import { generateWithGroq } from "./groq";
import { scrapeState } from "./scrapeState";

const cleanHtml = (html: string): string => {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const extractArticleContent = async (url: string): Promise<string> => {
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });

  const dom = new JSDOM(response.data, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article?.content) return "";
  return cleanHtml(article.content);
};

// get articles
export const getArticles = async (_req: Request, res: Response) => {
  const data = await db.select().from(articles);
  res.json(data);
};

// scrape and store articles
export const scrapeAndStoreArticles = async (
  _req: Request,
  res: Response
) => {
  try {
    scrapeState.isScraping = true;

    let url = "https://beyondchats.com/blogs";
    const allLinks: string[] = [];

    while (url) {
      const page = await axios.get(url);
      const dom = new JSDOM(page.data);
      const doc = dom.window.document;

      const links = [...doc.querySelectorAll("a")]
        .map((a) => a.href)
        .filter(
          (href) =>
            href.includes("/blogs/") &&
            !href.includes("/page/") &&
            !href.includes("#")
        );

      for (const link of links) {
        if (!allLinks.includes(link)) {
          allLinks.push(link);
        }
      }

      const next = doc.querySelector("a.next");
      if (!next) break;

      url = next.getAttribute("href")!;
    }

    const oldestFive = allLinks.slice(-5);

    for (const link of oldestFive) {
      const exists = await db
        .select()
        .from(articles)
        .where(eq(articles.sourceUrl, link));

      if (exists.length) continue;

      const content = await extractArticleContent(link);
      if (!content || content.length < 300) continue;

      const title = link
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/-/g, " ")
        ?.replace(/\b\w/g, (l) => l.toUpperCase());

      await db.insert(articles).values({
        title: title || "Untitled Article",
        content,
        sourceUrl: link,
        isUpdated: false,
      });
    }

    scrapeState.isScraping = false;
    res.json({ success: true });
  } catch (err) {
    scrapeState.isScraping = false;
    console.error("Scrape failed:", err);
    res.status(500).json({ error: "Scraping failed" });
  }
};

// enhance single article
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
      article.sourceUrl ?? ""
    );

    await db
      .update(articles)
      .set({
        enhancedContent: enhanced,
        isUpdated: true,
      })
      .where(eq(articles.id, id));

    res.json({ success: true });
  } catch (err: any) {
    console.error("Enhancement failed:", err);
    res.status(500).json({
      error: "Enhancement failed",
      details: err?.message,
    });
  }
};

// enhance all articles (testing)
export const enhanceAllArticles = async (_req: Request, res: Response) => {
  try {
    const all = await db.select().from(articles);

    for (const article of all) {
      if (article.isUpdated) continue;

      const enhanced = await generateWithGroq(article.content, "", "");

      await db
        .update(articles)
        .set({
          enhancedContent: enhanced,
          isUpdated: true,
        })
        .where(eq(articles.id, article.id));
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Bulk enhancement failed" });
  }
};
