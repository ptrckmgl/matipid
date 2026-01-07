import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BudgetCard } from '../components/BudgetCard';
import { SetBudgetModal } from '../components/SetBudgetModal';
import { useBudgets } from '../context/BudgetContext';

export default function BudgetsScreen() {
    const router = useRouter();
    const { getBudgetStatusForMonth, getCurrentMonth, deleteBudget } = useBudgets();
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

    const budgetStatuses = getBudgetStatusForMonth(selectedMonth);

    const handlePreviousMonth = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 2); // month is 1-indexed, so -2 to go back
        const newYear = date.getFullYear();
        const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        setSelectedMonth(`${newYear}-${newMonth}`);
    };

    const handleNextMonth = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month); // month is 1-indexed
        const newYear = date.getFullYear();
        const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        setSelectedMonth(`${newYear}-${newMonth}`);
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const handleBudgetCardPress = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setModalVisible(true);
    };

    const exceededCount = budgetStatuses.filter((bs) => bs.isExceeded).length;
    const warningCount = budgetStatuses.filter((bs) => bs.isWarning).length;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1 px-6 pt-4">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4 p-2 bg-white rounded-full border border-slate-100"
                    >
                        <ArrowLeft size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-slate-800">Budgets</Text>
                </View>

                {/* Month Selector */}
                <View className="flex-row items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <TouchableOpacity onPress={handlePreviousMonth} className="p-2">
                        <ChevronLeft size={24} color="#64748B" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-800">{formatMonth(selectedMonth)}</Text>
                    <TouchableOpacity onPress={handleNextMonth} className="p-2">
                        <ChevronRight size={24} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Budget Summary */}
                {budgetStatuses.length > 0 && (
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-full rounded-3xl p-6 shadow-xl shadow-indigo-200 mb-6"
                    >
                        <Text className="text-indigo-100 text-sm font-medium mb-2">Budget Overview</Text>
                        <View className="flex-row items-center gap-4">
                            <View>
                                <Text className="text-white text-3xl font-bold">{budgetStatuses.length}</Text>
                                <Text className="text-indigo-100 text-xs">Total Budgets</Text>
                            </View>
                            {exceededCount > 0 && (
                                <View>
                                    <Text className="text-red-300 text-2xl font-bold">{exceededCount}</Text>
                                    <Text className="text-indigo-100 text-xs">Exceeded</Text>
                                </View>
                            )}
                            {warningCount > 0 && (
                                <View>
                                    <Text className="text-amber-300 text-2xl font-bold">{warningCount}</Text>
                                    <Text className="text-indigo-100 text-xs">Warning</Text>
                                </View>
                            )}
                        </View>
                    </LinearGradient>
                )}

                {/* Budget List */}
                <View className="gap-4 mb-8">
                    {budgetStatuses.length === 0 ? (
                        <View className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm items-center">
                            <Text className="text-slate-400 font-medium text-center">
                                No budgets set for this month
                            </Text>
                            <Text className="text-slate-400 text-sm text-center mt-2">
                                Tap the + button to create your first budget
                            </Text>
                        </View>
                    ) : (
                        budgetStatuses.map((budgetStatus) => (
                            <BudgetCard
                                key={budgetStatus.budget.id}
                                budgetStatus={budgetStatus}
                                onPress={() => handleBudgetCardPress(budgetStatus.category.id)}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <View className="absolute bottom-9 right-10">
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        setSelectedCategoryId(undefined);
                        setModalVisible(true);
                    }}
                >
                    <LinearGradient
                        colors={['#C084FC', '#A855F7']}
                        className="w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-purple-300"
                        style={{ elevation: 8 }}
                    >
                        <Plus size={32} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <SetBudgetModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedCategoryId(undefined);
                }}
                initialCategoryId={selectedCategoryId}
                initialMonth={selectedMonth}
            />
        </SafeAreaView>
    );
}
