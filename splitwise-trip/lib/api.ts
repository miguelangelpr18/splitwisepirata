"use client";

import { supabase } from "./supabase";
import type { ExpenseRow, ExpenseWithSplits, Person, SplitRow } from "./types";

export async function fetchPeople(): Promise<Person[]> {
  const { data, error } = await supabase
    .from("people")
    .select("id, name, avatar_emoji")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Person[];
}

export async function fetchExpenses(): Promise<ExpenseWithSplits[]> {
  const { data: expenses, error: e1 } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });
  if (e1) throw e1;

  const { data: splits, error: e2 } = await supabase
    .from("expense_splits")
    .select("*");
  if (e2) throw e2;

  const byExpense = new Map<number, SplitRow[]>();
  for (const s of (splits ?? []) as SplitRow[]) {
    const list = byExpense.get(s.expense_id) ?? [];
    list.push(s);
    byExpense.set(s.expense_id, list);
  }

  return (expenses ?? []).map((e: ExpenseRow) => ({
    ...e,
    splits: byExpense.get(e.id) ?? [],
  }));
}

export async function createExpense(input: {
  description: string;
  amount: number;
  paid_by: number;
  date: string;
  category?: string;
  splits: { person_id: number; amount: number }[];
}): Promise<void> {
  const { data: inserted, error: e1 } = await supabase
    .from("expenses")
    .insert({
      description: input.description,
      amount: input.amount,
      paid_by: input.paid_by,
      date: input.date,
      category: input.category ?? "general",
      is_settlement: false,
    })
    .select()
    .single();

  if (e1 || !inserted) throw e1 ?? new Error("Insert failed");

  const rows = input.splits.map((s) => ({
    expense_id: inserted.id,
    person_id: s.person_id,
    amount: s.amount,
  }));
  const { error: e2 } = await supabase.from("expense_splits").insert(rows);
  if (e2) throw e2;
}

export async function createSettlement(input: {
  fromId: number;
  toId: number;
  amount: number;
  date: string;
}): Promise<void> {
  const { data: inserted, error: e1 } = await supabase
    .from("expenses")
    .insert({
      description: "Payment",
      amount: input.amount,
      paid_by: input.fromId,
      paid_to: input.toId,
      date: input.date,
      category: "settlement",
      is_settlement: true,
    })
    .select()
    .single();
  if (e1 || !inserted) throw e1 ?? new Error("Insert failed");

  const { error: e2 } = await supabase.from("expense_splits").insert({
    expense_id: inserted.id,
    person_id: input.toId,
    amount: input.amount,
  });
  if (e2) throw e2;
}

export async function deleteExpense(id: number): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
