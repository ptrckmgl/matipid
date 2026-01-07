import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AlertCircle, BarChart2, Plus, Settings, Target } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionItem } from '../components/TransactionItem';
import { Transaction, TransactionType } from '../constants/types';
import { useBudgets } from '../context/BudgetContext';
import { useTransactions } from '../context/TransactionContext';

export default function App() {
  const router = useRouter();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { getBudgetStatusForMonth, getCurrentMonth } = useBudgets();
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const currentBudgetStatuses = getBudgetStatusForMonth(getCurrentMonth());
  const exceededBudgets = currentBudgetStatuses.filter((bs) => bs.isExceeded);
  const warningBudgets = currentBudgetStatuses.filter((bs) => bs.isWarning);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const handleSaveTransaction = (amount: number, category: string, note: string, date: Date, type: TransactionType, id?: string) => {
    if (id) {
      updateTransaction({
        id,
        amount,
        category,
        note,
        date: date.toISOString(),
        type,
      });
    } else {
      addTransaction({
        amount,
        category,
        note,
        date: date.toISOString(),
        type,
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };

  const openModal = (type: TransactionType, transaction?: Transaction) => {
    setTransactionType(type);
    setSelectedTransaction(transaction || null);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="flex-row items-center justify-between mb-6 mt-2">
          <Text className="text-2xl font-bold text-slate-800">Overview</Text>
          <TouchableOpacity
            onPress={() => router.push('/settings' as any)}
            className="p-2 bg-white rounded-full border border-slate-100"
          >
            <Settings size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Budget Warnings */}
        {exceededBudgets.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/budgets' as any)}
            className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-4 flex-row items-center gap-3"
          >
            <AlertCircle size={24} color="#EF4444" />
            <View className="flex-1">
              <Text className="text-red-600 font-semibold">
                {exceededBudgets.length} Budget{exceededBudgets.length > 1 ? 's' : ''} Exceeded
              </Text>
              <Text className="text-red-500 text-xs">
                {exceededBudgets.map((b) => b.category.name).join(', ')}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {warningBudgets.length > 0 && exceededBudgets.length === 0 && (
          <TouchableOpacity
            onPress={() => router.push('/budgets' as any)}
            className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-4 flex-row items-center gap-3"
          >
            <AlertCircle size={24} color="#F59E0B" />
            <View className="flex-1">
              <Text className="text-amber-600 font-semibold">
                {warningBudgets.length} Budget{warningBudgets.length > 1 ? 's' : ''} Near Limit
              </Text>
              <Text className="text-amber-500 text-xs">
                {warningBudgets.map((b) => b.category.name).join(', ')}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <BalanceCard
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          onWalletPress={() => openModal('income')}
        />

        <View>
          <Text className="text-lg font-bold text-slate-800 mb-4">Recent Activity</Text>
          <View className="gap-4">
            {transactions.length === 0 ? (
              <Text className="text-slate-400 text-center mt-4">No transactions yet</Text>
            ) : (
              transactions.slice(0, 5).map((item) => (
                <TransactionItem
                  key={item.id}
                  transaction={item}
                  onPress={(t) => openModal(t.type, t)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-8 left-0 right-0 items-center px-6">
        <View
          className="bg-white w-full max-w-[220px] h-16 rounded-full flex-row items-center justify-between px-8 relative z-20 shadow-lg shadow-black/10"
          style={{ elevation: 8 }}
        >
          <TouchableOpacity onPress={() => router.push('/budgets' as any)}>
            <Target size={24} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>

          <View className="absolute left-0 right-0 items-center -top-10">
            <TouchableOpacity activeOpacity={0.9} onPress={() => openModal('expense')}>
              <LinearGradient
                colors={['#C084FC', '#A855F7']}
                className="w-20 h-20 rounded-full items-center justify-center border-4 border-slate-50 shadow-lg shadow-purple-300"
              >
                <Plus size={28} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/stats' as any)}>
            <BarChart2 size={24} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>


        </View>
      </View>

      <LinearGradient
        colors={['rgba(248,250,252,0)', '#F8FAFC']}
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        type={transactionType}
        initialTransaction={selectedTransaction}
      />
    </SafeAreaView>
  );
}