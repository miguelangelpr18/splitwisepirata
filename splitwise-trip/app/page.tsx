"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchExpenses, fetchPeople } from "@/lib/api";
import { computeBalances, pairwiseFromPerspective } from "@/lib/calculations";
import { money } from "@/lib/format";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { ExpenseWithSplits, Person } from "@/lib/types";
import { Loader, EmptyState } from "@/components/Loader";
import ExpenseRow from "@/components/ExpenseRow";

export default function DashboardPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUserId } = useCurrentUser();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ps, es] = await Promise.all([fetchPeople(), fetchExpenses()]);
        if (cancelled) return;
        setPeople(ps);
        setExpenses(es);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader label="Loading your trip…" />;
  if (error) return (
    <div className="mx-4 mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
      <div className="font-semibold">Couldn't load data</div>
      <div className="mt-1">{error}</div>
      <div className="mt-2 text-xs text-red-600">
        Double-check your Supabase URL / anon key in the Vercel environment variables.
      </div>
    </div>
  );

  const balances = computeBalances(people, expenses);
  const me = people.find((p) => p.id === currentUserId);
  const myBalance = balances.find((b) => b.personId === currentUserId)?.net ?? 0;
  const pairs = currentUserId ? pairwiseFromPerspective(currentUserId, people, expenses) : [];

  return (
    <div>
      {/* Hero balance card */}
      <section className="px-4 pt-5">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <div className="text-xs uppercase tracking-wide text-muted">
            {me ? `${me.name}'s overall balance` : "Overall balance"}
          </div>
          <div className={`mt-1 text-3xl font-bold ${myBalance > 0.005 ? "text-owed" : myBalance < -0.005 ? "text-owes" : "text-ink"}`}>
            {Math.abs(myBalance) < 0.01
              ? "You're all settled up 🎉"
              : myBalance > 0
              ? `+${money(myBalance)}`
              : `−${money(myBalance)}`}
          </div>
          <div className="mt-1 text-sm text-muted">
            {Math.abs(myBalance) < 0.01
              ? "Nothing to pay or collect."
              : myBalance > 0
              ? "You are owed this much in total."
              : "You owe this much in total."}
          </div>
        </div>
      </section>

      {/* Per-person balances (the other two) */}
      <section className="mt-5 px-4">
        <h2 className="mb-2 text-sm font-semibold text-muted">With your friends</h2>
        <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-card">
          {pairs.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">
              Pick who you are from the top-right menu.
            </div>
          )}
          {pairs.map((p) => (
            <div key={p.personId} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-lg">
                {p.avatar}
              </div>
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted">
                  {Math.abs(p.net) < 0.01
                    ? "settled up"
                    : p.net > 0
                    ? `owes you`
                    : `you owe`}
                </div>
              </div>
              <div className={`text-right text-sm font-semibold ${p.net > 0.005 ? "text-owed" : p.net < -0.005 ? "text-owes" : "text-muted"}`}>
                {Math.abs(p.net) < 0.01 ? "—" : money(p.net)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="mt-6 px-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Recent activity</h2>
          <Link href="/activity" className="text-xs font-medium text-brand-dark hover:underline">
            See all
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          {expenses.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              subtitle="Tap the green + button to log the first one."
              cta={
                <Link href="/add" className="inline-flex rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                  Add an expense
                </Link>
              }
            />
          ) : (
            expenses.slice(0, 8).map((e) => (
              <ExpenseRow key={e.id} expense={e} people={people} meId={currentUserId} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
