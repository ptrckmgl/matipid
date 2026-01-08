import {
  deleteTransactionFromDB,
  getAllTransactionsFromDB,
  insertTransactionToDB,
  updateTransactionInDB,
} from "@/utils/db";
import { formatValidationErrors, validateTransaction } from "@/utils/validation";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
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
      // Validate transaction data
      const validation = validateTransaction({
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
      });

      if (!validation.isValid) {
        const errorMessage = formatValidationErrors(validation.errors);
        Alert.alert("Invalid Transaction", errorMessage);
        throw new Error(errorMessage);
      }

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
      if (error instanceof Error && !error.message.includes("Invalid")) {
        Alert.alert("Error", "Failed to save transaction. Please try again.");
      }
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteTransactionFromDB(db, Number(id));
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      Alert.alert("Error", "Failed to delete transaction. Please try again.");
      throw error;
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      // Validate transaction data
      const validation = validateTransaction({
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
      });

      if (!validation.isValid) {
        const errorMessage = formatValidationErrors(validation.errors);
        Alert.alert("Invalid Transaction", errorMessage);
        throw new Error(errorMessage);
      }

      await updateTransactionInDB(db, transaction);
      setTransactions(transactions.map((t) => (t.id === transaction.id ? transaction : t)));
    } catch (error) {
      console.error("Failed to update transaction:", error);
      if (error instanceof Error && !error.message.includes("Invalid")) {
        Alert.alert("Error", "Failed to update transaction. Please try again.");
      }
      throw error;
    }
  };

  useEffect(() => {
    async function loadTransactions() {
      try {
        const allTransactions = await getAllTransactionsFromDB(db);
        setTransactions(allTransactions);
      } catch (error) {
        console.error("Failed to load transactions:", error);
        Alert.alert("Error", "Failed to load transactions. Please restart the app.");
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
