import React, { createContext, useContext, useState } from 'react';
import { Transaction } from '../constants/types';

interface TransactionContextType {
    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    updateTransaction: (transaction: Transaction) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transaction, id: Date.now().toString() };
        setTransactions([newTransaction, ...transactions]);
    };

    const deleteTransaction = (id: string) => {
        setTransactions(transactions.filter((t) => t.id !== id));
    };

    const updateTransaction = (transaction: Transaction) => {
        setTransactions(transactions.map((t) => (t.id === transaction.id ? transaction : t)));
    };

    return (
        <TransactionContext.Provider
            value={{ transactions, addTransaction, deleteTransaction, updateTransaction }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
};
