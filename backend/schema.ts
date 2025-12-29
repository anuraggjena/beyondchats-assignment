import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceUrl: text("source_url"),
  isUpdated: boolean("is_updated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
