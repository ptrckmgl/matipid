import * as SQLite from "expo-sqlite";

const db = await SQLite.openDatabaseAsync("matipid");

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

export async function insertTransaction(
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
