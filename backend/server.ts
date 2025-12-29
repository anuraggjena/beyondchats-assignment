import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import routes from "./routes";
import { db } from "./db";
import { articles } from "./schema";
import { scrapeAndStoreArticles } from "./controllers";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

const PORT = 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    const existing = await db.select().from(articles);

    if (existing.length === 0) {
      console.log("No articles found. Scraping initial data...");
      await scrapeAndStoreArticles(null as any, {
        json: () => {},
      } as any);
      console.log("Initial scraping completed.");
    } else {
      console.log("Articles already exist. Skipping scrape.");
    }
  } catch (error) {
    console.error("Startup scrape failed:", error);
  }
});
