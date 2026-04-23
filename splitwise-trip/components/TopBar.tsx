"use client";
import { useEffect, useState } from "react";
import { fetchPeople } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { Person } from "@/lib/types";

export default function TopBar() {
  const [people, setPeople] = useState<Person[]>([]);
  const { currentUserId, setCurrentUserId, loaded } = useCurrentUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchPeople().then(setPeople).catch(() => setPeople([]));
  }, []);

  // Auto-pick "Mike" if nothing is set yet (first visit).
  useEffect(() => {
    if (!loaded || currentUserId !== null || people.length === 0) return;
    const mike = people.find((p) => p.name.toLowerCase() === "mike") ?? people[0];
    setCurrentUserId(mike.id);
  }, [loaded, currentUserId, people, setCurrentUserId]);

  const me = people.find((p) => p.id === currentUserId);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted">Trip Split</div>
        <div className="text-lg font-semibold">Mike · Mau · Villalon</div>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-brand-light px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand/20"
        >
          <span className="text-base">{me?.avatar_emoji ?? "🙂"}</span>
          <span>{me?.name ?? "Pick you"}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-100 bg-white p-1 shadow-card">
            <div className="px-3 py-2 text-xs text-muted">I'm signed in as…</div>
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => { setCurrentUserId(p.id); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-cream ${
                  p.id === currentUserId ? "bg-brand-light text-brand-dark" : ""
                }`}
              >
                <span className="text-base">{p.avatar_emoji}</span>
                <span className="font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
