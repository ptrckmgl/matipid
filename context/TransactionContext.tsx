import {
  deleteTransactionFromDB,
  getAllTransactionsFromDB,
  insertTransactionToDB,
  updateTransactionInDB,
} from "@/utils/db";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useEffect, useState } from "react";
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
    try {
      const id = await insertTransactionToDB(
        db,
        transaction.amount,
        transaction.category,
        transaction.note ?? "",
        transaction.date,
        transaction.type
      );
      const newTransaction = { ...transaction, id: id.toString() };
      setTransactions([newTransaction, ...transactions]);
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteTransactionFromDB(db, Number(id));
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      await updateTransactionInDB(db, transaction);
      setTransactions(transactions.map((t) => (t.id === transaction.id ? transaction : t)));
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  useEffect(() => {
    async function loadTransactions() {
      try {
        const allTransactions = await getAllTransactionsFromDB(db);
        setTransactions(allTransactions);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      }
    }
    loadTransactions();
  }, [db]);

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
