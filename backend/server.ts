import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import routes from "./routes";
import { db } from "./db";
import { articles } from "./schema";
import { scrapeAndStoreArticles } from "./controllers";
import { scraperState } from "./scraperState";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  const existing = await db.select().from(articles);

  if (existing.length === 0) {
    console.log("Starting background scrape...");

    scraperState.isScraping = true;

    // run in background
    scrapeAndStoreArticles()
      .then(() => {
        scraperState.isScraping = false;
        console.log("Scraping completed");
      })
      .catch((err) => {
        scraperState.isScraping = false;
        console.error("Scraping failed:", err);
      });
  }
});