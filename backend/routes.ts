import { Router } from "express";
import { enhanceAllArticles, enhanceArticle, getArticles, scrapeAndStoreArticles } from "./controllers";
import { db } from "./db";
import { articles } from "./schema";

const router = Router();

router.get("/status", async (_req, res) => {
  const rows = await db.select().from(articles);
  res.json({
    scraping: rows.length === 0,
  });
});

router.get("/articles", getArticles);
router.post("/articles/scrape", scrapeAndStoreArticles);
router.post("/articles/:id/enhance", enhanceArticle);
router.post("/articles/enhance-all", enhanceAllArticles);

export default router;
