import { deleteCategoryFromDB, getAllCategoriesFromDB, insertCategoryToDB, updateCategoryInDB } from "@/utils/db";
import { formatValidationErrors, validateCategory } from "@/utils/validation";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
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
      Alert.alert("Error", "Failed to load categories. Please restart the app.");
    }
  };

  const addCategory = async (name: string, type: TransactionType, color: string, icon: string) => {
    try {
      // Validate category data
      const validation = validateCategory({ name, type, color, icon });
      if (!validation.isValid) {
        const errorMessage = formatValidationErrors(validation.errors);
        Alert.alert("Invalid Category", errorMessage);
        throw new Error(errorMessage);
      }

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
      if (error instanceof Error && !error.message.includes("Invalid")) {
        Alert.alert("Error", "Failed to save category. Please try again.");
      }
      throw error;
    }
  };

  const updateCategory = async (id: string, name: string, color: string, icon: string) => {
    try {
      // Find the category to get its type
      const category = categories.find((c) => c.id === id);
      if (!category) {
        Alert.alert("Error", "Category not found");
        throw new Error("Category not found");
      }

      // Validate category data
      const validation = validateCategory({ name, type: category.type, color, icon });
      if (!validation.isValid) {
        const errorMessage = formatValidationErrors(validation.errors);
        Alert.alert("Invalid Category", errorMessage);
        throw new Error(errorMessage);
      }

      await updateCategoryInDB(db, Number(id), name, color, icon);
      setCategories(categories.map((cat) => (cat.id === id ? { ...cat, name, color, icon } : cat)));
    } catch (error) {
      console.error("Failed to update category:", error);
      if (error instanceof Error && !error.message.includes("Invalid") && !error.message.includes("not found")) {
        Alert.alert("Error", "Failed to update category. Please try again.");
      }
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteCategoryFromDB(db, Number(id));
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Failed to delete category:", error);
      Alert.alert("Error", "Failed to delete category. Please try again.");
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
      }}>
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
