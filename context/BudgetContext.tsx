import {
    deleteBudgetFromDB,
    getAllBudgetsFromDB,
    upsertBudgetToDB
} from "@/utils/db";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Budget, BudgetStatus } from "../constants/types";
import { useCategories } from "./CategoryContext";
import { useTransactions } from "./TransactionContext";

interface BudgetContextType {
    budgets: Budget[];
    getBudgetsForMonth: (month: string) => Budget[];
    getBudgetStatusForMonth: (month: string) => BudgetStatus[];
    setBudget: (categoryId: string, limitAmount: number, month: string) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    getCurrentMonth: () => string;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const db = useSQLiteContext();
    const { categories } = useCategories();
    const { transactions } = useTransactions();

    const loadBudgets = async () => {
        try {
            const allBudgets = await getAllBudgetsFromDB(db);
            setBudgets(allBudgets);
        } catch (error) {
            console.error("Failed to load budgets:", error);
        }
    };

    const getBudgetsForMonth = (month: string): Budget[] => {
        return budgets.filter((budget) => budget.month === month);
    };

    const getBudgetStatusForMonth = (month: string): BudgetStatus[] => {
        const monthBudgets = getBudgetsForMonth(month);

        return monthBudgets.map((budget) => {
            const category = categories.find((cat) => cat.id === budget.categoryId);

            if (!category) {
                return {
                    budget,
                    category: { id: "", name: "Unknown", type: "expense", color: "#64748B", icon: "HelpCircle" },
                    spent: 0,
                    percentage: 0,
                    isExceeded: false,
                    isWarning: false,
                };
            }

            // Calculate spent amount for this category in this month
            const [year, monthNum] = month.split("-");
            const spent = transactions
                .filter((txn) => {
                    const txnDate = new Date(txn.date);
                    const txnYear = txnDate.getFullYear().toString();
                    const txnMonth = (txnDate.getMonth() + 1).toString().padStart(2, "0");
                    return (
                        txn.category === category.name &&
                        txn.type === "expense" &&
                        txnYear === year &&
                        txnMonth === monthNum
                    );
                })
                .reduce((sum, txn) => sum + txn.amount, 0);

            const percentage = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;
            const isExceeded = percentage >= 100;
            const isWarning = percentage >= 80 && !isExceeded;

            return {
                budget,
                category,
                spent,
                percentage,
                isExceeded,
                isWarning,
            };
        });
    };

    const setBudget = async (categoryId: string, limitAmount: number, month: string) => {
        try {
            await upsertBudgetToDB(db, Number(categoryId), limitAmount, month);
            await loadBudgets();
        } catch (error) {
            console.error("Failed to set budget:", error);
            throw error;
        }
    };

    const deleteBudget = async (id: string) => {
        try {
            await deleteBudgetFromDB(db, Number(id));
            setBudgets(budgets.filter((budget) => budget.id !== id));
        } catch (error) {
            console.error("Failed to delete budget:", error);
            throw error;
        }
    };

    const getCurrentMonth = (): string => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        return `${year}-${month}`;
    };

    useEffect(() => {
        if (categories.length > 0) {
            loadBudgets();
        }
    }, [db, categories]);

    return (
        <BudgetContext.Provider
            value={{
                budgets,
                getBudgetsForMonth,
                getBudgetStatusForMonth,
                setBudget,
                deleteBudget,
                getCurrentMonth,
            }}
        >
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudgets = () => {
    const context = useContext(BudgetContext);
    if (!context) {
        throw new Error("useBudgets must be used within a BudgetProvider");
    }
    return context;
};
