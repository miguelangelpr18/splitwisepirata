export type Person = {
  id: number;
  name: string;
  avatar_emoji: string;
};

export type ExpenseRow = {
  id: number;
  description: string;
  amount: number;
  paid_by: number;
  paid_to: number | null;
  date: string;
  category: string;
  is_settlement: boolean;
  created_at: string;
};

export type SplitRow = {
  id: number;
  expense_id: number;
  person_id: number;
  amount: number;
};

// Expense joined with its splits, as we render it in the UI
export type ExpenseWithSplits = ExpenseRow & {
  splits: SplitRow[];
};

// Net balance for a person across the whole trip.
// Positive = they are owed money. Negative = they owe money.
export type NetBalance = {
  personId: number;
  name: string;
  avatar: string;
  net: number;
};

// A simplified "X pays Y $Z" suggestion to settle everything with the
// minimum number of transactions.
export type SettleSuggestion = {
  fromId: number;
  fromName: string;
  toId: number;
  toName: string;
  amount: number;
};
