import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BarChart2, Clock, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionItem } from '../components/TransactionItem';
import { Transaction, TransactionType } from '../constants/types';
import { useTransactions } from '../context/TransactionContext';

export default function App() {
  const router = useRouter();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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
        <View className="mb-6 mt-2">
          <Text className="text-2xl font-bold text-slate-800">Overview</Text>
        </View>

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
          className="bg-white w-full max-w-[300px] h-16 rounded-full flex-row items-center justify-between px-8 relative z-20 shadow-lg shadow-black/10"
          style={{ elevation: 8 }}
        >
          <TouchableOpacity>
            <Clock size={24} color="#0F172A" strokeWidth={2} />
          </TouchableOpacity>

          <View className="absolute left-0 right-0 items-center -top-6">
            <TouchableOpacity activeOpacity={0.9} onPress={() => openModal('expense')}>
              <LinearGradient
                colors={['#C084FC', '#A855F7']}
                className="w-14 h-14 rounded-full items-center justify-center border-4 border-slate-50 shadow-lg shadow-purple-300"
              >
                <Plus size={28} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/stats' as any)}>
            <BarChart2 size={24} color="#94A3B8" strokeWidth={2} />
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