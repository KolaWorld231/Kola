"use client";
import React, { useEffect, useState } from "react";

type Card = {
  id: string;
  vocabularyId: string;
  vocabulary: { id?: string; word: string; translation: string };
};

export default function ReviewQueue() {
  const [queue, setQueue] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDue();
  }, []);

  async function fetchDue() {
    setLoading(true);
    try {
      const res = await fetch("/api/srs/due");
      const data = await res.json();
      setQueue(data.due || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function rate(card: Card, quality: number) {
    setLoading(true);
    try {
      await fetch("/api/srs/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vocabularyId: card.vocabularyId, quality }) });
      setQueue((q) => q.slice(1));
      if (queue.length < 3) fetchDue();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const current = queue[0];

  if (!mounted) return <div className="p-4">Loading review queue...</div>;
  if (loading && !current) return <div className="p-4">Loading review queue...</div>;
  if (!current) return <div className="p-4 text-gray-600">No cards due — good job!</div>;

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Review
      </h3>
      <div className="mb-4 animate-fadeIn">
        <div className="text-2xl font-extrabold">{current.vocabulary.word}</div>
        <div className="text-sm text-gray-500">{current.vocabulary.translation}</div>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5].map((q) => (
          <button key={q} onClick={() => rate(current, q)} className={`px-4 py-2 rounded-md shadow-sm transition transform hover:-translate-y-0.5 ${q >= 4 ? 'bg-green-50 text-green-700' : q >= 2 ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
            {q}
          </button>
        ))}
      </div>
      <div className="mt-3 text-sm text-gray-400">Card {1} of {queue.length}</div>
    </div>
  );
}
