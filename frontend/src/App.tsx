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

  // ✅ Fetch once on load
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API}/articles`);
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error("Failed to fetch articles", err);
    } finally {
      setLoading(false);
    }
  };

  const enhanceArticle = async (id: number) => {
    try {
      setEnhancingId(id);

      await fetch(`${API}/articles/${id}/enhance`, {
        method: "POST",
      });

      await fetchArticles();
    } catch (err) {
      console.error("Enhancement failed", err);
    } finally {
      setEnhancingId(null);
    }
  };

  // ⏳ Loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-neutral-700 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-lg">Loading articles...</p>
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
        <aside className="bg-neutral-900 rounded-xl p-4 h-[80vh] overflow-y-auto space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Articles
          </h2>

          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelected(article)}
              className={`p-3 rounded-lg cursor-pointer border ${
                selected?.id === article.id
                  ? "bg-neutral-800 border-blue-500"
                  : "border-neutral-800 hover:bg-neutral-800"
              }`}
            >
              <p className="text-sm font-medium line-clamp-2">
                {article.title}
              </p>

              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {article.isUpdated ? "Enhanced" : "Not enhanced"}
                </span>

                {!article.isUpdated && (
                  <button
                    className="text-xs bg-blue-600 px-2 py-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      enhanceArticle(article.id);
                    }}
                  >
                    {enhancingId === article.id
                      ? "Enhancing..."
                      : "Enhance"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="bg-neutral-900 rounded-xl p-6 h-[80vh] overflow-y-auto">
          {!selected ? (
            <p className="text-gray-500 text-center mt-20">
              Select an article to view content
            </p>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">
                {selected.title}
              </h2>

              <h3 className="text-sm text-gray-400 mb-2">
                Original Content
              </h3>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>
                  {selected.content}
                </ReactMarkdown>
              </div>

              <hr className="my-6 border-neutral-800" />

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
                <p className="text-gray-500">
                  Not enhanced yet.
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
