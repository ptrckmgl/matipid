export type TransactionType = 'expense' | 'income';

export interface Transaction {
    id: string;
    amount: number;
    category: string;
    note?: string;
    date: string; 
    type: TransactionType;
}

export const EXPENSE_CATEGORIES = [
    'Food and Drinks',
    'Education',
    'Clothes',
    'Transportation',
    'Entertainment',
    'Savings',
    'Others',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
