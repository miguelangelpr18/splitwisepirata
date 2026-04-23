import type {
  ExpenseWithSplits,
  NetBalance,
  Person,
  SettleSuggestion,
} from "./types";

/**
 * Compute the net balance for every person across all expenses+settlements.
 * - When someone PAYS an expense, they are credited the full amount paid.
 * - Each person is debited their share (from expense_splits).
 * - A SETTLEMENT is modeled as: payer pays amount to payee, with a single split
 *   of the full amount assigned to the payee. That moves the balance cleanly.
 */
export function computeBalances(
  people: Person[],
  expenses: ExpenseWithSplits[]
): NetBalance[] {
  const totals = new Map<number, number>();
  for (const p of people) totals.set(p.id, 0);

  for (const e of expenses) {
    totals.set(e.paid_by, (totals.get(e.paid_by) ?? 0) + Number(e.amount));
    for (const s of e.splits) {
      totals.set(s.person_id, (totals.get(s.person_id) ?? 0) - Number(s.amount));
    }
  }

  return people.map((p) => ({
    personId: p.id,
    name: p.name,
    avatar: p.avatar_emoji,
    net: round2(totals.get(p.id) ?? 0),
  }));
}

/**
 * Given the net balances, return the minimum set of transactions that settle
 * everyone up. Greedy algorithm: largest creditor paid by largest debtor each
 * round. Perfect for 3 people.
 */
export function suggestSettlements(balances: NetBalance[]): SettleSuggestion[] {
  const debtors   = balances.filter((b) => b.net < -0.005).map((b) => ({ ...b }));
  const creditors = balances.filter((b) => b.net >  0.005).map((b) => ({ ...b }));

  debtors.sort((a, b) => a.net - b.net);          // most negative first
  creditors.sort((a, b) => b.net - a.net);        // most positive first

  const out: SettleSuggestion[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(-debtors[i].net, creditors[j].net);
    if (pay > 0.005) {
      out.push({
        fromId: debtors[i].personId,
        fromName: debtors[i].name,
        toId: creditors[j].personId,
        toName: creditors[j].name,
        amount: round2(pay),
      });
      debtors[i].net   += pay;
      creditors[j].net -= pay;
    }
    if (Math.abs(debtors[i].net)   < 0.01) i++;
    if (Math.abs(creditors[j].net) < 0.01) j++;
  }
  return out;
}

/**
 * Pairwise balances from the perspective of a single "me": for each other
 * person, the net amount they owe me (positive) or I owe them (negative).
 * Splitwise shows this on the dashboard under each friend.
 */
export function pairwiseFromPerspective(
  me: number,
  people: Person[],
  expenses: ExpenseWithSplits[]
): { personId: number; name: string; avatar: string; net: number }[] {
  const map = new Map<number, number>();
  for (const p of people) if (p.id !== me) map.set(p.id, 0);

  for (const e of expenses) {
    // Every split line represents "person X owes the payer amount Y"
    for (const s of e.splits) {
      if (s.person_id === e.paid_by) continue;

      if (e.paid_by === me && s.person_id !== me) {
        // they owe me
        map.set(s.person_id, (map.get(s.person_id) ?? 0) + Number(s.amount));
      } else if (s.person_id === me && e.paid_by !== me) {
        // I owe the payer
        map.set(e.paid_by, (map.get(e.paid_by) ?? 0) - Number(s.amount));
      }
    }
  }

  return people
    .filter((p) => p.id !== me)
    .map((p) => ({
      personId: p.id,
      name: p.name,
      avatar: p.avatar_emoji,
      net: round2(map.get(p.id) ?? 0),
    }));
}

/** Split an amount equally among N people, correctly distributing the penny rounding. */
export function splitEqually(total: number, ids: number[]): { person_id: number; amount: number }[] {
  const cents = Math.round(total * 100);
  const base  = Math.floor(cents / ids.length);
  const extra = cents - base * ids.length; // 0..N-1 extra pennies
  return ids.map((id, i) => ({
    person_id: id,
    amount: (base + (i < extra ? 1 : 0)) / 100,
  }));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
