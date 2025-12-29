import { Router } from "express";
import { enhanceAllArticles, getArticles, scrapeAndStoreArticles } from "./controllers";

const router = Router();

router.get("/articles", getArticles);
router.post("/articles/scrape", scrapeAndStoreArticles);
router.post("/articles/enhance-all", enhanceAllArticles);

export default router;
