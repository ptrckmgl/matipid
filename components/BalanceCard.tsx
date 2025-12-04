import { LinearGradient } from 'expo-linear-gradient';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface BalanceCardProps {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    onWalletPress: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ totalBalance, totalIncome, totalExpense, onWalletPress }) => {
    return (
        <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-64 rounded-[32px] p-6 shadow-xl shadow-indigo-200 mb-8 overflow-hidden relative"
            style={{ elevation: 10 }}
        >
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full" />
            <View className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 opacity-20 rounded-full" />

            <View className="flex-1 justify-between z-10">
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-indigo-100 text-sm font-medium mb-1">Total Balance</Text>
                        <Text className="text-4xl font-bold text-white tracking-tight">₱{totalBalance.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={onWalletPress}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/10"
                    >
                        <Wallet size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between mt-2">
                    <View>
                        <Text className="text-indigo-100 text-xs font-medium mb-1">Income</Text>
                        <View className="flex-row items-center">
                            <TrendingUp size={16} color="#6EE7B7" style={{ marginRight: 4 }} />
                            <Text className="text-white font-semibold text-lg">₱{totalIncome.toFixed(2)}</Text>
                        </View>
                    </View>
                    <View>
                        <Text className="text-indigo-100 text-xs font-medium mb-1">Expense</Text>
                        <View className="flex-row items-center">
                            <TrendingDown size={16} color="#FCA5A5" style={{ marginRight: 4 }} />
                            <Text className="text-white font-semibold text-lg">₱{totalExpense.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};
