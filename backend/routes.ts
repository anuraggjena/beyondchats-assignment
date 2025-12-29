import { Router } from "express";
import { getArticles, createArticle } from "./controllers";

const router = Router();

router.get("/articles", getArticles);
router.post("/articles", createArticle);

export default router;
