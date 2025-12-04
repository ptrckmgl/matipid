import { useRouter } from 'expo-router';
import { ArrowLeft, PieChart as PieIcon } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EXPENSE_CATEGORIES } from '../constants/types';
import { useTransactions } from '../context/TransactionContext';

export default function StatsScreen() {
    const router = useRouter();
    const { transactions } = useTransactions();

    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalBalance = totalIncome - totalExpense;
    const savings = totalIncome > totalExpense ? totalIncome - totalExpense : 0;

    const expenseByCategory = EXPENSE_CATEGORIES.map((cat) => {
        const amount = transactions
            .filter((t) => t.type === 'expense' && t.category === cat)
            .reduce((acc, curr) => acc + curr.amount, 0);
        return { category: cat, amount };
    }).filter((item) => item.amount > 0);

    const pieData = expenseByCategory.map((item, index) => ({
        value: item.amount,
        color: [
            '#F97316', 
            '#3B82F6', 
            '#A855F7', 
            '#EF4444', 
            '#EC4899', 
            '#10B981', 
            '#64748B', 
        ][index % 7],
        text: `${((item.amount / totalExpense) * 100).toFixed(0)}%`,
    }));

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1 px-6 pt-4">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-white rounded-full border border-slate-100">
                        <ArrowLeft size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-slate-800">Statistics</Text>
                </View>

                <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
                    <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <Text className="text-slate-400 text-xs font-medium uppercase mb-1">Total Balance</Text>
                        <Text className="text-xl font-bold text-slate-800">₱{totalBalance.toFixed(2)}</Text>
                    </View>
                    <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <Text className="text-slate-400 text-xs font-medium uppercase mb-1">Savings</Text>
                        <Text className="text-xl font-bold text-emerald-600">₱{savings.toFixed(2)}</Text>
                    </View>
                    <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <Text className="text-slate-400 text-xs font-medium uppercase mb-1">Total Income</Text>
                        <Text className="text-xl font-bold text-indigo-600">₱{totalIncome.toFixed(2)}</Text>
                    </View>
                    <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <Text className="text-slate-400 text-xs font-medium uppercase mb-1">Total Expense</Text>
                        <Text className="text-xl font-bold text-red-500">₱{totalExpense.toFixed(2)}</Text>
                    </View>
                </View>

                {totalExpense > 0 ? (
                    <View className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 items-center">
                        <Text className="text-lg font-bold text-slate-800 mb-6 self-start">Expense Distribution</Text>
                        <PieChart
                            data={pieData}
                            donut
                            showText
                            textColor="white"
                            radius={120}
                            innerRadius={60}
                            textSize={12}
                            fontWeight="bold"
                        />

                        <View className="w-full mt-6 gap-3">
                            {expenseByCategory.map((item, index) => (
                                <View key={item.category} className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-2">
                                        <View
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: pieData[index].color }}
                                        />
                                        <Text className="text-slate-600 font-medium">{item.category}</Text>
                                    </View>
                                    <Text className="text-slate-800 font-bold">₱{item.amount.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-8 items-center">
                        <PieIcon size={48} color="#CBD5E1" />
                        <Text className="text-slate-400 font-medium mt-4">No expenses to show</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
