"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense, fetchPeople } from "@/lib/api";
import { splitEqually, round2 } from "@/lib/calculations";
import { money, CURRENCY_SYMBOL } from "@/lib/format";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { Person } from "@/lib/types";
import { Loader } from "@/components/Loader";

type SplitMode = "equal" | "exact";

export default function AddExpensePage() {
  const router = useRouter();
  const { currentUserId } = useCurrentUser();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [paidBy, setPaidBy] = useState<number | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [participants, setParticipants] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<SplitMode>("equal");
  const [exactShares, setExactShares] = useState<Record<number, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const ps = await fetchPeople();
        setPeople(ps);
        setParticipants(new Set(ps.map((p) => p.id))); // everyone by default
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (paidBy === null && currentUserId !== null) setPaidBy(currentUserId);
  }, [paidBy, currentUserId]);

  const amount = Number(amountStr) || 0;

  const splits = useMemo(() => {
    const ids = [...participants];
    if (mode === "equal") return splitEqually(amount, ids);
    return ids.map((id) => ({ person_id: id, amount: Number(exactShares[id] ?? 0) || 0 }));
  }, [amount, participants, mode, exactShares]);

  const splitsTotal = round2(splits.reduce((s, x) => s + x.amount, 0));
  const exactMismatch = mode === "exact" && Math.abs(splitsTotal - amount) > 0.009;

  const togglePerson = (id: number) => {
    setParticipants((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const canSubmit =
    !submitting &&
    description.trim().length > 0 &&
    amount > 0 &&
    paidBy !== null &&
    participants.size > 0 &&
    !exactMismatch;

  const submit = async () => {
    if (!canSubmit || paidBy === null) return;
    setSubmitting(true);
    setError(null);
    try {
      await createExpense({
        description: description.trim(),
        amount: round2(amount),
        paid_by: paidBy,
        date: new Date(date).toISOString(),
        splits,
      });
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-semibold">Add expense</h1>

      <div className="mt-4 space-y-3">
        <Field label="Description">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Hotel, dinner, Uber, gas…"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-brand"
          />
        </Field>

        <Field label="Amount">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-3 focus-within:border-brand">
            <span className="mr-1 text-muted">{CURRENCY_SYMBOL}</span>
            <input
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              placeholder="0.00"
              className="w-full bg-transparent text-base outline-none"
            />
            <span className="ml-2 text-xs text-muted">MXN</span>
          </div>
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-brand"
          />
        </Field>

        <Field label="Paid by">
          <div className="grid grid-cols-3 gap-2">
            {people.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaidBy(p.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm transition ${
                  paidBy === p.id
                    ? "border-brand bg-brand-light text-brand-dark"
                    : "border-gray-200 bg-white text-ink hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{p.avatar_emoji}</span>
                <span className="font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Split between">
          <div className="grid grid-cols-3 gap-2">
            {people.map((p) => {
              const checked = participants.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePerson(p.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm transition ${
                    checked
                      ? "border-brand bg-brand-light text-brand-dark"
                      : "border-gray-200 bg-white text-muted hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{p.avatar_emoji}</span>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-[11px]">{checked ? "included" : "excluded"}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="How to split">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode("equal")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "equal" ? "bg-white text-ink shadow" : "text-muted"
              }`}
            >
              Equally
            </button>
            <button
              type="button"
              onClick={() => setMode("exact")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "exact" ? "bg-white text-ink shadow" : "text-muted"
              }`}
            >
              Exact amounts
            </button>
          </div>

          {mode === "equal" && participants.size > 0 && amount > 0 && (
            <div className="mt-3 rounded-xl bg-brand-light/60 p-3 text-sm">
              Each person pays{" "}
              <span className="font-semibold">{money(amount / participants.size)}</span>
              {" — "}
              <span className="text-muted">{participants.size} people</span>
            </div>
          )}

          {mode === "exact" && (
            <div className="mt-3 space-y-2">
              {[...participants].map((id) => {
                const p = people.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <div key={id} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
                    <span className="text-lg">{p.avatar_emoji}</span>
                    <span className="flex-1 text-sm font-medium">{p.name}</span>
                    <span className="text-muted">{CURRENCY_SYMBOL}</span>
                    <input
                      inputMode="decimal"
                      value={exactShares[id] ?? ""}
                      onChange={(e) =>
                        setExactShares((prev) => ({
                          ...prev,
                          [id]: e.target.value.replace(/[^\d.]/g, ""),
                        }))
                      }
                      placeholder="0.00"
                      className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-right text-sm outline-none focus:border-brand"
                    />
                  </div>
                );
              })}
              <div className={`text-right text-xs ${exactMismatch ? "text-owes" : "text-muted"}`}>
                Shares total {money(splitsTotal)} / {money(amount)}
                {exactMismatch && " — doesn't match"}
              </div>
            </div>
          )}
        </Field>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="mt-5 w-full rounded-full bg-brand py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save expense"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      {children}
    </label>
  );
}
