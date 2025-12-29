import { Router } from "express";
import { enhanceAllArticles, enhanceArticle, getArticles, scrapeAndStoreArticles } from "./controllers";
import { scrapeState } from "./scrapeState";

const router = Router();

router.get("/status", (_req, res) => {
  res.json({
    scraping: scrapeState.isScraping,
  });
});
router.get("/articles", getArticles);
router.post("/articles/scrape", scrapeAndStoreArticles);
router.post("/articles/:id/enhance", enhanceArticle);
router.post("/articles/enhance-all", enhanceAllArticles);

export default router;
