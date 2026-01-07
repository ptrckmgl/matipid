import * as SQLite from "expo-sqlite";
import { Budget, Category, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, Transaction } from "../constants/types";

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
  );
  
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    UNIQUE(name, type)
  );
  
  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY NOT NULL,
    category_id INTEGER NOT NULL,
    limit_amount REAL NOT NULL,
    month TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(category_id, month)
  );
  `);

  // Seed default categories if none exist
  const categoryCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM categories"
  );

  if (categoryCount?.count === 0) {
    // Insert default expense categories
    for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
      await db.runAsync(
        "INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)",
        [cat.name, 'expense', cat.color, cat.icon]
      );
    }

    // Insert default income categories
    for (const cat of DEFAULT_INCOME_CATEGORIES) {
      await db.runAsync(
        "INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)",
        [cat.name, 'income', cat.color, cat.icon]
      );
    }
  }
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
  }>("SELECT * FROM transactions ORDER BY date DESC");

  return result.map((row) => ({
    ...row,
    id: row.id.toString(),
  }));
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================

export async function getAllCategoriesFromDB(db: SQLite.SQLiteDatabase): Promise<Category[]> {
  const result = await db.getAllAsync<{
    id: number;
    name: string;
    type: "expense" | "income";
    color: string;
    icon: string;
  }>("SELECT * FROM categories ORDER BY type, name");

  return result.map((row) => ({
    ...row,
    id: row.id.toString(),
  }));
}

export async function insertCategoryToDB(
  db: SQLite.SQLiteDatabase,
  name: string,
  type: "expense" | "income",
  color: string,
  icon: string
): Promise<number> {
  const result = await db.runAsync(
    "INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)",
    [name, type, color, icon]
  );
  return result.lastInsertRowId;
}

export async function updateCategoryInDB(
  db: SQLite.SQLiteDatabase,
  id: number,
  name: string,
  color: string,
  icon: string
): Promise<void> {
  await db.runAsync(
    "UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?",
    [name, color, icon, id]
  );
}

export async function deleteCategoryFromDB(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<void> {
  // Check if category is used in transactions
  const usage = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM transactions WHERE category = (SELECT name FROM categories WHERE id = ?)",
    [id]
  );

  if (usage && usage.count > 0) {
    throw new Error("Cannot delete category that is used in transactions");
  }

  await db.runAsync("DELETE FROM categories WHERE id = ?", [id]);
}

// ============================================
// BUDGET FUNCTIONS
// ============================================

export async function getAllBudgetsFromDB(db: SQLite.SQLiteDatabase): Promise<Budget[]> {
  const result = await db.getAllAsync<{
    id: number;
    category_id: number;
    limit_amount: number;
    month: string;
  }>("SELECT * FROM budgets ORDER BY month DESC");

  return result.map((row) => ({
    id: row.id.toString(),
    categoryId: row.category_id.toString(),
    limitAmount: row.limit_amount,
    month: row.month,
  }));
}

export async function getBudgetsForMonthFromDB(
  db: SQLite.SQLiteDatabase,
  month: string
): Promise<Budget[]> {
  const result = await db.getAllAsync<{
    id: number;
    category_id: number;
    limit_amount: number;
    month: string;
  }>("SELECT * FROM budgets WHERE month = ?", [month]);

  return result.map((row) => ({
    id: row.id.toString(),
    categoryId: row.category_id.toString(),
    limitAmount: row.limit_amount,
    month: row.month,
  }));
}

export async function upsertBudgetToDB(
  db: SQLite.SQLiteDatabase,
  categoryId: number,
  limitAmount: number,
  month: string
): Promise<void> {
  await db.runAsync(
    `INSERT INTO budgets (category_id, limit_amount, month) VALUES (?, ?, ?)
     ON CONFLICT(category_id, month) DO UPDATE SET limit_amount = ?`,
    [categoryId, limitAmount, month, limitAmount]
  );
}

export async function deleteBudgetFromDB(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync("DELETE FROM budgets WHERE id = ?", [id]);
}

// ============================================
// DATA MANAGEMENT FUNCTIONS
// ============================================

export async function exportDataToJSON(db: SQLite.SQLiteDatabase): Promise<string> {
  const transactions = await getAllTransactionsFromDB(db);
  const categories = await getAllCategoriesFromDB(db);
  const budgets = await getAllBudgetsFromDB(db);

  return JSON.stringify({
    version: 1,
    exportDate: new Date().toISOString(),
    transactions,
    categories,
    budgets,
  }, null, 2);
}

export async function importDataFromJSON(
  db: SQLite.SQLiteDatabase,
  jsonData: string
): Promise<void> {
  const data = JSON.parse(jsonData);

  // Clear existing data
  await db.execAsync(`
    DELETE FROM budgets;
    DELETE FROM transactions;
    DELETE FROM categories;
  `);

  // Import categories
  if (data.categories && Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      await db.runAsync(
        "INSERT INTO categories (id, name, type, color, icon) VALUES (?, ?, ?, ?, ?)",
        [Number(cat.id), cat.name, cat.type, cat.color, cat.icon]
      );
    }
  }

  // Import transactions
  if (data.transactions && Array.isArray(data.transactions)) {
    for (const txn of data.transactions) {
      await db.runAsync(
        "INSERT INTO transactions (id, amount, category, note, date, type) VALUES (?, ?, ?, ?, ?, ?)",
        [Number(txn.id), txn.amount, txn.category, txn.note || "", txn.date, txn.type]
      );
    }
  }

  // Import budgets
  if (data.budgets && Array.isArray(data.budgets)) {
    for (const budget of data.budgets) {
      await db.runAsync(
        "INSERT INTO budgets (id, category_id, limit_amount, month) VALUES (?, ?, ?, ?)",
        [Number(budget.id), Number(budget.categoryId), budget.limitAmount, budget.month]
      );
    }
  }
}



