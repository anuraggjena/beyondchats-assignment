import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import routes from "./routes";
import { db } from "./db";
import { articles } from "./schema";
import { scrapeAndStoreArticles } from "./controllers";

const app = express();

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use(cors());
app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    const existing = await db.select().from(articles);

    if (existing.length === 0) {
      console.log("No articles found. Running initial scrape...");
      await scrapeAndStoreArticles({} as any, { json: () => {} } as any);
      console.log("Scraping completed");
    } else {
      console.log("Articles already exist");
    }
  } catch (err) {
    console.error("Startup error:", err);
  }
});
