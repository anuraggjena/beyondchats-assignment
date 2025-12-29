import { Router } from "express";
import { getArticles, scrapeAndStoreArticles } from "./controllers";

const router = Router();

router.get("/articles", getArticles);
router.post("/articles/scrape", scrapeAndStoreArticles);

export default router;
