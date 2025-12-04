import { insertTransaction } from "@/utils/db";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useState } from "react";
import { Transaction } from "../constants/types";

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const db = useSQLiteContext();

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    // Insert into DB
    const id = await insertTransaction(
      db,
      transaction.amount,
      transaction.category,
      transaction.note ?? "",
      transaction.date,
      transaction.type
    );
    // Add to local state
    const newTransaction = { ...transaction, id: id.toString() };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const updateTransaction = (transaction: Transaction) => {
    setTransactions(transactions.map((t) => (t.id === transaction.id ? transaction : t)));
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction, updateTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
};
