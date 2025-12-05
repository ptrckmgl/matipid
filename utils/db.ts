import * as SQLite from "expo-sqlite";
import { Transaction } from "../constants/types";

export async function initDB(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY NOT NULL,
  amount REAL,
  category TEXT,
  note TEXT,
  date TEXT,
  type TEXT
)
  `);
}

export async function insertTransactionToDB(
  db: SQLite.SQLiteDatabase,
  amount: number,
  category: string,
  note: string,
  date: string,
  type: string
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO transactions (amount, category, note, date, type) VALUES (?, ?, ?, ?, ?)`,
    [amount, category, note, date, type]
  );
  return result.lastInsertRowId;
}

export async function deleteTransactionFromDB(db: SQLite.SQLiteDatabase, id: number) {
  await db.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
}

export async function updateTransactionInDB(db: SQLite.SQLiteDatabase, transaction: Transaction) {
  await db.runAsync(`UPDATE transactions SET amount = ?, category = ?, note = ?, date = ?, type = ? WHERE id = ?`, [
    transaction.amount,
    transaction.category,
    transaction.note ?? "",
    transaction.date,
    transaction.type,
    Number(transaction.id),
  ]);
}

export async function getAllTransactionsFromDB(db: SQLite.SQLiteDatabase): Promise<Transaction[]> {
  const result = await db.getAllAsync<{
    id: number;
    amount: number;
    category: string;
    note: string;
    date: string;
    type: "expense" | "income";
  }>("SELECT * FROM transactions");

  return result.map((row) => ({
    ...row,
    id: row.id.toString(),
  }));
}
