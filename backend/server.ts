import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import routes from "./routes";
import { db } from "./db";
import { articles } from "./schema";
import { scrapeAndStoreArticles } from "./controllers";
import { scrapeState } from "./scrapeState";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT! || 5000;

app.get("/api/status", (_req, res) => {
  res.json({ scraping: scrapeState.isScraping });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    const existing = await db.select().from(articles);

    if (existing.length === 0) {
      console.log("No articles found. Starting auto-scrape...");

      scrapeState.isScraping = true;

      await scrapeAndStoreArticles(
        null as any,
        { json: () => {} } as any
      );

      scrapeState.isScraping = false;
      console.log("Auto-scraping completed.");
    } else {
      scrapeState.isScraping = false;
      console.log("Articles already exist. Skipping scrape.");
    }
  } catch (error) {
    scrapeState.isScraping = false;
    console.error("Startup scrape failed:", error);
  }
});
