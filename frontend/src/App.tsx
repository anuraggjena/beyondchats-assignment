import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type Article = {
  id: number;
  title: string;
  content: string;
  enhancedContent: string | null;
  isUpdated: boolean;
};

const API = "http://localhost:5000/api";

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [enhancingId, setEnhancingId] = useState<number | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    const res = await fetch(`${API}/articles`);
    const data = await res.json();
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const enhanceArticle = async (id: number) => {
  try {
    setEnhancingId(id);

    await fetch(`${API}/articles/${id}/enhance`, {
      method: "POST",
    });

    // Re-fetch updated list
    const res = await fetch(`${API}/articles`);
    const updatedArticles: Article[] = await res.json();

    setArticles(updatedArticles);

    // 🔥 IMPORTANT: update selected article from fresh data
    const updated = updatedArticles.find(a => a.id === id);
    if (updated) {
      setSelected(updated);
    }
  } catch (err) {
    console.error("Enhancement failed:", err);
  } finally {
    setEnhancingId(null);
  }
};

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4">
        <h1 className="text-2xl font-semibold">
          BeyondChats AI Article Enhancer
        </h1>
        <p className="text-sm text-gray-400">
          Compare original content with AI-enhanced versions
        </p>
      </header>

      {/* Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-6">
        
        {/* Sidebar */}
        <aside className="bg-neutral-900 rounded-xl p-4 h-[80vh] overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Articles
          </h2>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading articles...</p>
          ) : (
            <div className="space-y-2">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelected(article)}
                  className={`p-3 rounded-lg cursor-pointer transition border
                    ${
                      selected?.id === article.id
                        ? "bg-neutral-800 border-blue-500"
                        : "border-neutral-800 hover:bg-neutral-800"
                    }
                  `}
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
                        className={`mt-2 text-xs px-3 py-1 rounded
                          ${
                            enhancingId === article.id
                              ? "bg-gray-600 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }
                        `}
                      >
                        {enhancingId === article.id ? "Enhancing..." : "Enhance Article"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Content Panel */}
        <main className="bg-neutral-900 rounded-xl p-6 h-[80vh] overflow-y-auto">
          {!selected && (
            <div className="text-gray-500 text-center mt-20">
              Select an article to view its content
            </div>
          )}

          {selected && (
            <>
              <h2 className="text-xl font-semibold mb-6">
                {selected.title}
              </h2>

              {/* Original */}
              <section className="mb-8">
                <h3 className="text-sm text-gray-400 mb-2">
                  Original Content
                </h3>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {selected.content}
                  </ReactMarkdown>
                </div>
              </section>

              {/* Enhanced */}
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
