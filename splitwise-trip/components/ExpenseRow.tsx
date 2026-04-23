"use client";
import Link from "next/link";
import type { ExpenseWithSplits, Person } from "@/lib/types";
import { money, relativeDate } from "@/lib/format";

export default function ExpenseRow({
  expense,
  people,
  meId,
  editable = false,
}: {
  expense: ExpenseWithSplits;
  people: Person[];
  meId: number | null;
  editable?: boolean;
}) {
  const payer = people.find((p) => p.id === expense.paid_by);

  // What does "me" get out of this row?
  let myLine: { kind: "lent" | "borrowed" | "none" | "received"; amount: number } = { kind: "none", amount: 0 };
  if (meId != null) {
    if (expense.is_settlement) {
      if (expense.paid_by === meId) myLine = { kind: "lent", amount: Number(expense.amount) };
      else if (expense.paid_to === meId) myLine = { kind: "received", amount: Number(expense.amount) };
    } else {
      const myShare = expense.splits.find((s) => s.person_id === meId)?.amount ?? 0;
      if (expense.paid_by === meId) {
        const othersShare = expense.splits
          .filter((s) => s.person_id !== meId)
          .reduce((sum, s) => sum + Number(s.amount), 0);
        if (othersShare > 0) myLine = { kind: "lent", amount: othersShare };
      } else if (myShare > 0) {
        myLine = { kind: "borrowed", amount: Number(myShare) };
      }
    }
  }

  const isSettlement = expense.is_settlement;

  const Wrapper = (props: { children: React.ReactNode }) =>
    editable ? (
      <Link
        href={`/edit/${expense.id}`}
        className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50 active:bg-gray-100"
      >
        {props.children}
      </Link>
    ) : (
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
        {props.children}
      </div>
    );

  return (
    <Wrapper>
      <div className="flex w-14 flex-col items-center">
        <div className="text-[10px] uppercase tracking-wide text-muted">{relativeDate(expense.date).slice(0, 3)}</div>
        <div className="text-lg font-bold">{new Date(expense.date).getDate()}</div>
      </div>

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          isSettlement ? "bg-brand-light text-brand-dark" : "bg-gray-100"
        }`}
        aria-hidden
      >
        {isSettlement ? "💸" : categoryEmoji(expense.category, expense.description)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">
          {isSettlement
            ? `${payer?.name ?? "?"} paid ${people.find((p) => p.id === expense.paid_to)?.name ?? "?"}`
            : expense.description}
        </div>
        {!isSettlement && (
          <div className="text-xs text-muted">
            {payer?.name} paid <span className="font-medium">{money(Number(expense.amount))}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end text-right">
        {myLine.kind === "lent" && (
          <>
            <div className="text-[11px] text-owed">you lent</div>
            <div className="text-sm font-semibold text-owed">{money(myLine.amount)}</div>
          </>
        )}
        {myLine.kind === "borrowed" && (
          <>
            <div className="text-[11px] text-owes">you borrowed</div>
            <div className="text-sm font-semibold text-owes">{money(myLine.amount)}</div>
          </>
        )}
        {myLine.kind === "received" && (
          <>
            <div className="text-[11px] text-owed">you received</div>
            <div className="text-sm font-semibold text-owed">{money(myLine.amount)}</div>
          </>
        )}
        {myLine.kind === "none" && (
          <div className="text-[11px] text-muted">not involved</div>
        )}
        {editable && (
          <div className="mt-1 text-[11px] text-muted">edit ›</div>
        )}
      </div>
    </Wrapper>
  );
}

function categoryEmoji(cat: string, desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes("uber") || d.includes("taxi") || d.includes("lyft")) return "🚕";
  if (d.includes("hotel") || d.includes("airbnb") || d.includes("hostel")) return "🏨";
  if (d.includes("flight") || d.includes("plane") || d.includes("avion")) return "✈️";
  if (d.includes("gas") || d.includes("gasolina")) return "⛽";
  if (d.includes("beer") || d.includes("bar") || d.includes("drink") || d.includes("cerveza")) return "🍺";
  if (d.includes("coffee") || d.includes("cafe") || d.includes("café")) return "☕";
  if (d.includes("dinner") || d.includes("lunch") || d.includes("food") || d.includes("comida") || d.includes("cena")) return "🍽️";
  if (d.includes("super") || d.includes("groceries") || d.includes("market")) return "🛒";
  return "🧾";
}
