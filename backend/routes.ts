import { Router } from "express";
import {
  getArticles,
  getStatus,
  enhanceArticle,
} from "./controllers";

const router = Router();

router.get("/status", getStatus);
router.get("/articles", getArticles);
router.post("/articles/:id/enhance", enhanceArticle);

export default router;
