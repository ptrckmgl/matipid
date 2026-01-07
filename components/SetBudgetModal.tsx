import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useBudgets } from '../context/BudgetContext';
import { useCategories } from '../context/CategoryContext';
import { CategoryIcon } from './CategoryIcon';

interface SetBudgetModalProps {
    visible: boolean;
    onClose: () => void;
    initialCategoryId?: string;
    initialMonth?: string;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
    visible,
    onClose,
    initialCategoryId,
    initialMonth,
}) => {
    const { expenseCategories } = useCategories();
    const { setBudget, getCurrentMonth, budgets } = useBudgets();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState(getCurrentMonth());
    const [errors, setErrors] = useState({ amount: false });

    useEffect(() => {
        if (visible) {
            setMonth(initialMonth || getCurrentMonth());
            if (initialCategoryId) {
                setSelectedCategoryId(initialCategoryId);
                // Find existing budget for this category and month
                const existingBudget = budgets.find(
                    (b) => b.categoryId === initialCategoryId && b.month === (initialMonth || getCurrentMonth())
                );
                if (existingBudget) {
                    setAmount(existingBudget.limitAmount.toString());
                }
            } else {
                setSelectedCategoryId(expenseCategories[0]?.id || '');
                setAmount('');
                setErrors({ amount: false });
            }
        }
    }, [visible, initialCategoryId, initialMonth]);

    const handleSave = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setErrors({ ...errors, amount: true });
            return;
        }

        if (!selectedCategoryId) {
            Alert.alert('No Category', 'Please select a category.');
            return;
        }

        try {
            await setBudget(selectedCategoryId, numAmount, month);
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to save budget. Please try again.');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-[32px] p-6 h-[75%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-bold text-slate-800">Set Budget</Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
                            <X size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="mb-6">
                            <Text className="text-slate-500 font-medium mb-2">Month</Text>
                            <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <Text className="text-slate-800 font-medium">{month}</Text>
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-slate-500 font-medium mb-2">Category</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {expenseCategories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setSelectedCategoryId(cat.id)}
                                        className={`px-4 py-3 rounded-2xl border flex-row items-center gap-2 ${selectedCategoryId === cat.id
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <CategoryIcon
                                            iconName={cat.icon}
                                            color={selectedCategoryId === cat.id ? 'white' : cat.color}
                                            size={16}
                                        />
                                        <Text
                                            className={`font-medium ${selectedCategoryId === cat.id ? 'text-white' : 'text-slate-600'
                                                }`}
                                        >
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="mb-8">
                            <Text className="text-slate-500 font-medium mb-2">Budget Limit</Text>
                            <View className={`flex-row items-center bg-slate-50 p-4 rounded-2xl border ${errors.amount ? 'border-red-500' : 'border-slate-200'}`}>
                                <Text className="text-2xl font-bold text-slate-800 mr-2">₱</Text>
                                <TextInput
                                    className={`flex-1 ${errors.amount ? 'text-base italic text-slate-800 opacity-70' : 'text-2xl font-bold text-slate-800'}`}
                                    placeholder={errors.amount ? "*Required*" : "0.00"}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={(text) => {
                                        setAmount(text);
                                        if (text) setErrors({ ...errors, amount: false });
                                    }}
                                    placeholderTextColor={errors.amount ? "#EF4444" : "#94A3B8"}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-indigo-600 p-4 rounded-2xl items-center shadow-lg shadow-indigo-200 mb-8"
                        >
                            <Text className="text-white font-bold text-lg">Save Budget</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
