import {
    deleteCategoryFromDB,
    getAllCategoriesFromDB,
    insertCategoryToDB,
    updateCategoryInDB,
} from "@/utils/db";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Category, TransactionType } from "../constants/types";

interface CategoryContextType {
    categories: Category[];
    expenseCategories: Category[];
    incomeCategories: Category[];
    addCategory: (name: string, type: TransactionType, color: string, icon: string) => Promise<void>;
    updateCategory: (id: string, name: string, color: string, icon: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    getCategoryByName: (name: string) => Category | undefined;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const db = useSQLiteContext();

    const loadCategories = async () => {
        try {
            const allCategories = await getAllCategoriesFromDB(db);
            setCategories(allCategories);
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    const addCategory = async (name: string, type: TransactionType, color: string, icon: string) => {
        try {
            const id = await insertCategoryToDB(db, name, type, color, icon);
            const newCategory: Category = {
                id: id.toString(),
                name,
                type,
                color,
                icon,
            };
            setCategories([...categories, newCategory]);
        } catch (error) {
            console.error("Failed to add category:", error);
            throw error;
        }
    };

    const updateCategory = async (id: string, name: string, color: string, icon: string) => {
        try {
            await updateCategoryInDB(db, Number(id), name, color, icon);
            setCategories(
                categories.map((cat) =>
                    cat.id === id ? { ...cat, name, color, icon } : cat
                )
            );
        } catch (error) {
            console.error("Failed to update category:", error);
            throw error;
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            await deleteCategoryFromDB(db, Number(id));
            setCategories(categories.filter((cat) => cat.id !== id));
        } catch (error) {
            console.error("Failed to delete category:", error);
            throw error;
        }
    };

    const getCategoryByName = (name: string): Category | undefined => {
        return categories.find((cat) => cat.name === name);
    };

    useEffect(() => {
        loadCategories();
    }, [db]);

    const expenseCategories = categories.filter((cat) => cat.type === "expense");
    const incomeCategories = categories.filter((cat) => cat.type === "income");

    return (
        <CategoryContext.Provider
            value={{
                categories,
                expenseCategories,
                incomeCategories,
                addCategory,
                updateCategory,
                deleteCategory,
                getCategoryByName,
            }}
        >
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error("useCategories must be used within a CategoryProvider");
    }
    return context;
};
