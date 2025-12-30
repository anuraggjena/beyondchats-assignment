# Backend – BeyondChats AI Article Enhancer

This backend handles scraping blog articles from BeyondChats, storing them in a database, and enhancing them using AI. It exposes APIs that the frontend uses to fetch and enhance articles.

## Tech Stack

- **Node.js**
- **Express**
- **TypeScript**
- **PostgreSQL**
- **Drizzle ORM**
- **Groq AI (LLaMA 3.1)**
- **Axios**
- **Cheerio**

## Folder Structure

```
backend/
│
├── controllers.ts    # API logic
├── grok.ts           # AI enhancement logic
├── db.ts             # Database connection
├── schema.ts         # Database schema
├── routes.ts         # API routes
├── scrapeState.ts    # Auto-scraping Loader
├── server.ts         # App entry point
├── drizzle/          # Migrations
├── .env              # Environment variables
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create `.env` File

Create a `.env` file in the backend directory with the following variables:

```env
DATABASE_URL=your_postgres_connection_string
GROQ_API_KEY=your_groq_api_key
SERPER_API_KEY=your_serper_api_key
```

### 3. Start the Server

```bash
npm run dev
```

The server will run at: `http://localhost:5000`

## Database Schema

### Table: `articles`

| Column            | Type    | Description              |
|-------------------|---------|--------------------------|
| `id`              | serial  | Primary key              |
| `title`           | text    | Article title            |
| `content`         | text    | Original article content |
| `source_url`      | text    | Blog URL                 |
| `enhanced_content`| text    | AI enhanced content      |
| `is_updated`      | boolean | Enhancement status       |

## API Endpoints

### 1. Scrape Articles
- **Endpoint:** `POST /api/articles/scrape`
- **Description:** Scrapes articles from BeyondChats and stores them in the database.

#### Automatic Data Initialization

On server startup, the backend checks whether any articles exist in the database.

- If no articles are found, it automatically scrapes the latest blog posts.
- If articles already exist, scraping is skipped to avoid duplicates.

This ensures the system works correctly even on a fresh deployment without requiring any manual setup.

### 2. Get All Articles
- **Endpoint:** `GET /api/articles`
- **Description:** Returns all stored articles.

### 3. Enhance Single Article
- **Endpoint:** `POST /api/articles/:id/enhance`
- **Description:** Enhances a specific article using AI.

### 4. Enhance All Articles
- **Endpoint:** `POST /api/articles/enhance-all`
- **Description:** Enhances all articles that are not yet processed.

## AI Integration

- **Model:** Groq LLaMA 3.1 (8B)
- **Features:**
  - Fast and reliable
  - Good quality structured output
  - Works within free tier

## How Enhancement Works

1. Article is scraped and cleaned.
2. Content is sent to Groq.
3. AI rewrites the content.
4. Enhanced text is stored in the database.
5. Frontend displays both versions.

## Error Handling

- Invalid API keys are handled gracefully.
- Empty content is ignored.
- Duplicate articles are avoided.
- Safe fallback for AI failures.

## Status

- **Scraping:** Working
- **AI Enhancement:** Working
- **Database:** Connected
- **API:** Stable

## Notes

- API key is required for enhancement.
- Scraping works without AI.
- Designed for assignment evaluation.