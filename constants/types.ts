export type TransactionType = 'expense' | 'income';

export interface Transaction {
    id: string;
    amount: number;
    category: string;
    note?: string;
    date: string; 
    type: TransactionType;
}

// Category Management
export interface Category {
    id: string;
    name: string;
    type: TransactionType;
    color: string;
    icon: string;
}

// Budget Management
export interface Budget {
    id: string;
    categoryId: string;
    limitAmount: number;
    month: string; // Format: YYYY-MM
}

export interface BudgetStatus {
    budget: Budget;
    category: Category;
    spent: number;
    percentage: number;
    isExceeded: boolean;
    isWarning: boolean; // 80%+
}

// Default categories - will be used for seeding database
export const DEFAULT_EXPENSE_CATEGORIES = [
    { name: 'Food and Drinks', color: '#F97316', icon: 'Coffee' },
    { name: 'Education', color: '#3B82F6', icon: 'BookOpen' },
    { name: 'Clothes', color: '#A855F7', icon: 'Shirt' },
    { name: 'Transportation', color: '#EF4444', icon: 'Car' },
    { name: 'Entertainment', color: '#EC4899', icon: 'Gift' },
    { name: 'Savings', color: '#10B981', icon: 'PiggyBank' },
    { name: 'Others', color: '#64748B', icon: 'HelpCircle' },
] as const;

export const DEFAULT_INCOME_CATEGORIES = [
    { name: 'Salary', color: '#6366F1', icon: 'Briefcase' },
    { name: 'Business', color: '#8B5CF6', icon: 'TrendingUp' },
    { name: 'Gift', color: '#EC4899', icon: 'Gift' },
    { name: 'Investment', color: '#10B981', icon: 'Landmark' },
    { name: 'Other', color: '#64748B', icon: 'DollarSign' },
] as const;

// Keep for backward compatibility
export const EXPENSE_CATEGORIES = DEFAULT_EXPENSE_CATEGORIES.map(c => c.name);
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
