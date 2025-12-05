import {
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  DollarSign,
  Gift,
  HelpCircle,
  Landmark,
  PiggyBank,
  Shirt,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Transaction } from "../constants/types";

interface TransactionItemProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
}

const getCategoryIcon = (category: string, type: "expense" | "income") => {
  if (type === "expense") {
    switch (category) {
      case "Food and Drinks":
        return <Coffee size={20} color="#F97316" />;
      case "Education":
        return <BookOpen size={20} color="#3B82F6" />;
      case "Clothes":
        return <Shirt size={20} color="#A855F7" />;
      case "Transportation":
        return <Car size={20} color="#EF4444" />;
      case "Entertainment":
        return <Gift size={20} color="#EC4899" />;
      case "Savings":
        return <PiggyBank size={20} color="#10B981" />;
      default:
        return <HelpCircle size={20} color="#64748B" />;
    }
  } else {
    switch (category) {
      case "Salary":
        return <Briefcase size={20} color="#6366F1" />;
      case "Business":
        return <TrendingUp size={20} color="#10B981" />;
      case "Gift":
        return <Gift size={20} color="#EC4899" />;
      case "Investment":
        return <Landmark size={20} color="#8B5CF6" />;
      default:
        return <DollarSign size={20} color="#64748B" />;
    }
  }
};

const getCategoryBg = (category: string, type: "expense" | "income") => {
  if (type === "expense") {
    switch (category) {
      case "Food and Drinks":
        return "bg-orange-100";
      case "Education":
        return "bg-blue-100";
      case "Clothes":
        return "bg-purple-100";
      case "Transportation":
        return "bg-red-100";
      case "Entertainment":
        return "bg-pink-100";
      case "Savings":
        return "bg-emerald-100";
      default:
        return "bg-slate-100";
    }
  } else {
    switch (category) {
      case "Salary":
        return "bg-indigo-100";
      case "Business":
        return "bg-emerald-100";
      case "Gift":
        return "bg-pink-100";
      case "Investment":
        return "bg-purple-100";
      default:
        return "bg-slate-100";
    }
  }
};

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const isExpense = transaction.type === "expense";
  const amountColor = isExpense ? "text-red-600" : "text-emerald-600";
  const sign = isExpense ? "-" : "+";

  return (
    <TouchableOpacity
      onPress={() => onPress(transaction)}
      className="flex-row items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
      style={{ elevation: 2 }}>
      <View className="flex-row items-center gap-4">
        <View
          className={`w-12 h-12 ${getCategoryBg(
            transaction.category,
            transaction.type
          )} rounded-xl items-center justify-center`}>
          {getCategoryIcon(transaction.category, transaction.type)}
        </View>
        <View>
          <Text className="font-bold text-slate-800 text-base">{transaction.category}</Text>
          <Text className="text-slate-400 text-xs font-medium">{new Date(transaction.date).toLocaleDateString()}</Text>
          {transaction.note ? <Text className="text-slate-400 text-xs italic">{transaction.note}</Text> : null}
        </View>
      </View>
      <Text className={`font-bold text-base ${amountColor}`}>
        {sign}₱{transaction.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
};
