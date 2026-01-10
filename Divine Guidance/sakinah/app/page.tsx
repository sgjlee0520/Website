"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Loader2, RotateCw } from "lucide-react";

type Guidance = {
  arabic: string;
  translation: string;
  source: string;
  guidance: string;
};

export default function Home() {
  const [worry, setWorry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Guidance | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worry.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worry }),
      });

      if (!res.ok) throw new Error("Failed to seek guidance.");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWorry("");
    setResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#1B4D3E] rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-[128px] translate-x-1/2 translate-y-1/2" />
        {/* Geometric Pattern Overlay Hint */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(#1B4D3E 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="z-10 w-full max-w-2xl">
        <header className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-2">
            Bismillahir Rahmanir Rahim
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1B4D3E] mb-2 tracking-tight">
            Sakinah
          </h1>
          <p className="text-[#1B4D3E]/70 font-medium">Find Tranquility in Divine Wisdom</p>
        </header>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
                <div className="w-full relative group">
                  <input
                    type="text"
                    value={worry}
                    onChange={(e) => setWorry(e.target.value)}
                    placeholder="What weighs on your heart today?"
                    className="w-full px-8 py-6 text-lg md:text-xl rounded-2xl border-2 border-[#1B4D3E]/10 bg-white/50 backdrop-blur-sm focus:border-[#1B4D3E]/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1B4D3E]/5 transition-all shadow-sm placeholder:text-[#1B4D3E]/30 text-[#1B4D3E] text-center"
                    disabled={loading}
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {loading ? (
                      <Loader2 className="w-6 h-6 text-[#1B4D3E] animate-spin" />
                    ) : (
                      worry && (
                        <button
                          type="submit"
                          className="p-2 bg-[#1B4D3E] text-white rounded-full hover:bg-[#153e32] transition-colors"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="bg-white rounded-3xl shadow-xl border border-[#1B4D3E]/5 overflow-hidden"
            >
              <div className="p-8 md:p-12 relative">
                {/* Decorative borders */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1B4D3E] via-[#D4AF37] to-[#1B4D3E]" />

                <div className="text-center mb-10">
                  <h2 className="font-amiri text-3xl md:text-4xl text-[#1B4D3E] mb-6 leading-relaxed" dir="rtl">
                    {result.arabic}
                  </h2>
                  <p className="text-lg text-[#1B4D3E]/80 italic mb-4 font-serif">
                    "{result.translation}"
                  </p>
                  <p className="text-xs tracking-widest uppercase text-[#D4AF37] font-bold">
                    {result.source}
                  </p>
                </div>

                <div className="bg-[#F8F9FA] rounded-2xl p-6 md:p-8 border-l-4 border-[#D4AF37]">
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-6 h-6 text-[#D4AF37] shrink-0 mt-1" />
                    <div className="space-y-4">
                      <p className="text-[#1B4D3E] leading-relaxed">
                        {result.guidance}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 text-sm text-[#1B4D3E]/50 hover:text-[#1B4D3E] transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                    Seek Guidance Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
