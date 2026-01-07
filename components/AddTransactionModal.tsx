import DateTimePicker from '@react-native-community/datetimepicker';
import {
    Calendar,
    Trash2,
    X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Transaction, TransactionType } from '../constants/types';
import { useCategories } from '../context/CategoryContext';
import { CategoryIcon } from './CategoryIcon';

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (amount: number, category: string, note: string, date: Date, type: TransactionType, id?: string) => void;
    onDelete?: (id: string) => void;
    type: TransactionType;
    initialTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
    visible,
    onClose,
    onSubmit,
    onDelete,
    type,
    initialTransaction
}) => {
    const { expenseCategories, incomeCategories, getCategoryByName } = useCategories();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState({ amount: false });

    const categories = type === 'expense' ? expenseCategories : incomeCategories;

    useEffect(() => {
        if (initialTransaction) {
            setAmount(initialTransaction.amount.toString());
            setCategory(initialTransaction.category);
            setNote(initialTransaction.note || '');
            setDate(new Date(initialTransaction.date));
        } else {
            resetForm();
        }
    }, [initialTransaction, visible, categories]);

    useEffect(() => {
        if (categories.length > 0 && !category) {
            setCategory(categories[0].name);
        }
    }, [categories]);

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setErrors({ ...errors, amount: true });
            return;
        }
        onSubmit(numAmount, category, note, date, type, initialTransaction?.id);
        resetForm();
        onClose();
    };

    const handleDelete = () => {
        if (initialTransaction && onDelete) {
            Alert.alert(
                "Delete Transaction",
                "Are you sure you want to delete this transaction?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                            onDelete(initialTransaction.id);
                            onClose();
                        }
                    }
                ]
            );
        }
    };

    const resetForm = () => {
        setAmount('');
        setCategory(categories.length > 0 ? categories[0].name : '');
        setNote('');
        setDate(new Date());
        setNote('');
        setDate(new Date());
        setErrors({ amount: false });
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-[32px] p-6 h-[85%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-bold text-slate-800">
                            {initialTransaction ? 'Edit' : 'Add'} {type === 'expense' ? 'Expense' : 'Income'}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
                            <X size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="mb-6">
                            <Text className="text-slate-500 font-medium mb-2">Amount</Text>
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

                        <View className="mb-6">
                            <Text className="text-slate-500 font-medium mb-2">Category</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setCategory(cat.name)}
                                        className={`px-4 py-3 rounded-2xl border flex-row items-center gap-2 ${category === cat.name
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <CategoryIcon
                                            iconName={cat.icon}
                                            color={category === cat.name ? 'white' : cat.color}
                                            size={16}
                                        />
                                        <Text
                                            className={`font-medium ${category === cat.name ? 'text-white' : 'text-slate-600'
                                                }`}
                                        >
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-slate-500 font-medium mb-2">Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="flex-row items-center bg-slate-50 p-4 rounded-2xl border border-slate-200"
                            >
                                <Calendar size={20} color="#64748B" style={{ marginRight: 12 }} />
                                <Text className="text-slate-800 font-medium">{date.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                />
                            )}
                        </View>

                        <View className="mb-8">
                            <Text className="text-slate-500 font-medium mb-2">Note (Optional)</Text>
                            <TextInput
                                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800"
                                placeholder="Add a note..."
                                value={note}
                                onChangeText={setNote}
                                multiline
                                placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <View className="gap-4 mb-8">
                            <TouchableOpacity
                                onPress={handleSubmit}
                                className="bg-indigo-600 p-4 rounded-2xl items-center shadow-lg shadow-indigo-200"
                            >
                                <Text className="text-white font-bold text-lg">
                                    {initialTransaction ? 'Update' : 'Save'} Transaction
                                </Text>
                            </TouchableOpacity>

                            {initialTransaction && (
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    className="flex-row items-center justify-center bg-red-50 p-4 rounded-2xl border border-red-100"
                                >
                                    <Trash2 size={20} color="#EF4444" style={{ marginRight: 8 }} />
                                    <Text className="text-red-500 font-bold text-lg">Delete Transaction</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
