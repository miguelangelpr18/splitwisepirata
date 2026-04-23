"use client";
import { useEffect, useState } from "react";

const KEY = "splitwise-trip:current-user-id";

/** Tiny hook that remembers which person "you" are picked as. */
export function useCurrentUser() {
  const [id, setId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) setId(Number(raw));
    setLoaded(true);
  }, []);

  const update = (newId: number) => {
    setId(newId);
    if (typeof window !== "undefined") localStorage.setItem(KEY, String(newId));
  };

  return { currentUserId: id, setCurrentUserId: update, loaded };
}
