import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Article = {
  id: number;
  title: string;
  content: string;
  enhancedContent: string | null;
  isUpdated: boolean;
};

const API = "https://beyondchats-backend-ctvd.onrender.com/api";

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [loadingServer, setLoadingServer] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [enhancingId, setEnhancingId] = useState<number | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // fetch articles
  const fetchArticles = async () => {
    try {
      setLoadingArticles(true);
      const res = await fetch(`${API}/articles`);
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error("Failed to fetch articles", err);
    } finally {
      setLoadingArticles(false);
    }
  };

  // check backend scraping status
  const checkStatus = async () => {
    try {
      const res = await fetch(`${API}/status`);
      const data = await res.json();

      if (!data.scraping) {
        setLoadingServer(false);
        await fetchArticles();

        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch (err) {
      console.error("Status check failed", err);
    }
  };

  // start polling once
  useEffect(() => {
    pollingRef.current = setInterval(checkStatus, 1500);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // enhance article
  const enhanceArticle = async (id: number) => {
    try {
      setEnhancingId(id);

      await fetch(`${API}/articles/${id}/enhance`, {
        method: "POST",
      });

      const res = await fetch(`${API}/articles`);
      const updated = await res.json();
      setArticles(updated);

      const refreshed = updated.find((a: Article) => a.id === id);
      if (refreshed) setSelected(refreshed);
    } catch (err) {
      console.error("Enhancement failed", err);
    } finally {
      setEnhancingId(null);
    }
  };

  // loading Screen
  if (loadingServer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-neutral-700 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-lg font-medium">Preparing articles…</p>
          <p className="text-sm text-gray-400">
            Fetching content for the first time
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-6 py-4">
        <h1 className="text-2xl font-semibold">
          BeyondChats AI Article Enhancer
        </h1>
        <p className="text-sm text-gray-400">
          Compare original content with AI-enhanced versions
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-6">
        {/* Sidebar */}
        <aside className="bg-neutral-900 rounded-xl p-4 h-[80vh] overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Articles
          </h2>

          {loadingArticles ? (
            <p className="text-gray-500 text-sm">Loading articles...</p>
          ) : (
            <div className="space-y-2">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelected(article)}
                  className={`p-3 rounded-lg cursor-pointer border transition ${
                    selected?.id === article.id
                      ? "bg-neutral-800 border-blue-500"
                      : "border-neutral-800 hover:bg-neutral-800"
                  }`}
                >
                  <p className="text-sm font-medium line-clamp-2">
                    {article.title}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs ${
                        article.isUpdated
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {article.isUpdated ? "Enhanced" : "Not enhanced"}
                    </span>

                    {!article.isUpdated && (
                      <button
                        disabled={enhancingId === article.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          enhanceArticle(article.id);
                        }}
                        className={`text-xs px-3 py-1 rounded ${
                          enhancingId === article.id
                            ? "bg-gray-600"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {enhancingId === article.id
                          ? "Enhancing..."
                          : "Enhance"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Content */}
        <main className="bg-neutral-900 rounded-xl p-6 h-[80vh] overflow-y-auto">
          {!selected ? (
            <div className="text-gray-500 text-center mt-20">
              Select an article to view its content
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-6">
                {selected.title}
              </h2>

              <section className="mb-8">
                <h3 className="text-sm text-gray-400 mb-2">
                  Original Content
                </h3>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{selected.content}</ReactMarkdown>
                </div>
              </section>

              <section className="border-t border-neutral-800 pt-6">
                <h3 className="text-sm text-gray-400 mb-2">
                  Enhanced Content
                </h3>

                {selected.enhancedContent ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>
                      {selected.enhancedContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    This article has not been enhanced yet.
                  </p>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
