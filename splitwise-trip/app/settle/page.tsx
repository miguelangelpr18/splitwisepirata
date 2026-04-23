"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSettlement, fetchExpenses, fetchPeople } from "@/lib/api";
import { computeBalances, suggestSettlements } from "@/lib/calculations";
import { money, CURRENCY_SYMBOL } from "@/lib/format";
import type { ExpenseWithSplits, Person, SettleSuggestion } from "@/lib/types";
import { Loader } from "@/components/Loader";

export default function SettlePage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [manual, setManual] = useState<{ from: number | null; to: number | null; amount: string }>(
    { from: null, to: null, amount: "" }
  );
  const [submitting, setSubmitting] = useState<string | null>(null);

  const load = async () => {
    try {
      const [ps, es] = await Promise.all([fetchPeople(), fetchExpenses()]);
      setPeople(ps);
      setExpenses(es);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loader />;
  if (error) return <div className="mx-4 mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>;

  const balances = computeBalances(people, expenses);
  const suggestions: SettleSuggestion[] = suggestSettlements(balances);
  const isSettled = suggestions.length === 0;

  const recordSuggested = async (s: SettleSuggestion) => {
    setSubmitting(`${s.fromId}-${s.toId}-${s.amount}`);
    try {
      await createSettlement({
        fromId: s.fromId,
        toId: s.toId,
        amount: s.amount,
        date: new Date().toISOString(),
      });
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(null);
    }
  };

  const recordManual = async () => {
    const amt = Number(manual.amount);
    if (!manual.from || !manual.to || manual.from === manual.to || !(amt > 0)) return;
    setSubmitting("manual");
    try {
      await createSettlement({
        fromId: manual.from,
        toId: manual.to,
        amount: amt,
        date: new Date().toISOString(),
      });
      setManual({ from: null, to: null, amount: "" });
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-semibold">Settle up</h1>
      <p className="mt-1 text-sm text-muted">
        Record a real-world payment between two people. Nothing here moves money by itself.
      </p>

      {/* Suggested settlements */}
      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-muted">Suggested (least transactions)</h2>
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          {isSettled ? (
            <div className="px-4 py-8 text-center">
              <div className="mb-2 text-4xl">🎉</div>
              <div className="text-base font-semibold">Everyone is settled up</div>
              <div className="text-sm text-muted">Nothing to pay.</div>
            </div>
          ) : (
            suggestions.map((s) => {
              const key = `${s.fromId}-${s.toId}-${s.amount}`;
              const from = people.find((p) => p.id === s.fromId);
              const to   = people.find((p) => p.id === s.toId);
              return (
                <div key={key} className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{from?.avatar_emoji}</span>
                    <div>
                      <div className="text-sm">
                        <span className="font-semibold">{from?.name}</span>
                        {" pays "}
                        <span className="font-semibold">{to?.name}</span>
                      </div>
                      <div className="text-base font-bold text-brand-dark">{money(s.amount)}</div>
                    </div>
                    <span className="text-xl">{to?.avatar_emoji}</span>
                  </div>
                  <button
                    disabled={submitting === key}
                    onClick={() => recordSuggested(s)}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
                  >
                    {submitting === key ? "…" : "Record"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Manual settlement */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">Record any payment</h2>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="mb-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">From</div>
            <div className="flex gap-2">
              {people.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setManual((m) => ({ ...m, from: p.id }))}
                  className={`flex-1 rounded-xl border px-2 py-2 text-sm ${manual.from === p.id ? "border-brand bg-brand-light text-brand-dark" : "border-gray-200"}`}
                >
                  <div className="text-lg">{p.avatar_emoji}</div>
                  <div className="font-medium">{p.name}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">To</div>
            <div className="flex gap-2">
              {people.filter((p) => p.id !== manual.from).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setManual((m) => ({ ...m, to: p.id }))}
                  className={`flex-1 rounded-xl border px-2 py-2 text-sm ${manual.to === p.id ? "border-brand bg-brand-light text-brand-dark" : "border-gray-200"}`}
                >
                  <div className="text-lg">{p.avatar_emoji}</div>
                  <div className="font-medium">{p.name}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Amount</div>
            <div className="flex items-center rounded-xl border border-gray-200 px-3 py-3">
              <span className="mr-1 text-muted">{CURRENCY_SYMBOL}</span>
              <input
                inputMode="decimal"
                value={manual.amount}
                onChange={(e) => setManual((m) => ({ ...m, amount: e.target.value.replace(/[^\d.]/g, "") }))}
                placeholder="0.00"
                className="w-full bg-transparent text-base outline-none"
              />
              <span className="ml-2 text-xs text-muted">MXN</span>
            </div>
          </div>
          <button
            disabled={submitting === "manual" || !manual.from || !manual.to || manual.from === manual.to || !(Number(manual.amount) > 0)}
            onClick={recordManual}
            className="w-full rounded-full bg-brand py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-dark disabled:opacity-50"
          >
            {submitting === "manual" ? "Saving…" : "Record payment"}
          </button>
        </div>
      </section>

      <button
        onClick={() => router.push("/")}
        className="mt-6 w-full rounded-full border border-gray-200 bg-white py-3 text-sm font-medium text-muted hover:text-ink"
      >
        Back to dashboard
      </button>
    </div>
  );
}
