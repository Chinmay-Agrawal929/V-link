import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, ExternalLink, Loader2, Sparkles, BookOpen, RefreshCw, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export default function SearchRadar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    sources: Array<{ title: string; uri: string }>;
    searchQueries: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickQueries = [
    'React 19 newest features & breaking changes',
    'Python 3.13 free-threaded GIL updates',
    'Upcoming tech symposiums & hackathons in Chennai',
    'Best open source beginner repos on GitHub 2025'
  ];

  const handleSearch = async (searchTopic?: string) => {
    const q = (searchTopic || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    if (searchTopic) setQuery(searchTopic);

    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch search results');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Search grounding error:', err);
      setError(err.message || 'Error fetching live search grounding data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-blue-900/15 via-zinc-900/60 to-zinc-900/90 shadow-xl mb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Live Tech & Campus Radar</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                Google Search Grounding
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Powered by gemini-3.5-flash with real-time web search grounding
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2 mb-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation, hackathon dates, tech updates..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested Quick Queries */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
        {quickQueries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSearch(q)}
            disabled={loading}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs mb-3">
          {error}
        </div>
      )}

      {/* Results View */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3"
          >
            {/* Answer Content */}
            <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-gray-200 leading-relaxed">
              <ReactMarkdown>{result.answer}</ReactMarkdown>
            </div>

            {/* Grounded Web Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="pt-3 border-t border-white/10">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Globe className="w-3 h-3 text-blue-400" /> Grounded via Google Search Sources ({result.sources.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-blue-300 hover:text-blue-200 border border-white/5 flex items-center justify-between gap-2 text-xs transition-colors group"
                    >
                      <span className="truncate font-medium">{source.title || 'Web Reference'}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 text-gray-400 group-hover:text-blue-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
