"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchExpenses, fetchPeople } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { ExpenseWithSplits, Person } from "@/lib/types";
import { Loader, EmptyState } from "@/components/Loader";
import ExpenseRow from "@/components/ExpenseRow";
import { money } from "@/lib/format";

export default function ActivityPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUserId } = useCurrentUser();

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

  const tripTotal = expenses
    .filter((e) => !e.is_settlement)
    .reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">All activity</h1>
        <div className="text-right text-xs text-muted">
          Trip total spent
          <div className="text-base font-semibold text-ink">{money(tripTotal)}</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-card">
        {expenses.length === 0 ? (
          <EmptyState
            title="Nothing logged yet"
            subtitle="Expenses and settlements will show up here."
            cta={
              <Link href="/add" className="inline-flex rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                Add first expense
              </Link>
            }
          />
        ) : (
          expenses.map((e) => (
            <ExpenseRow
              key={e.id}
              expense={e}
              people={people}
              meId={currentUserId}
              editable
            />
          ))
        )}
      </div>
    </div>
  );
}
