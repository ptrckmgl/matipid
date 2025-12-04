import DateTimePicker from '@react-native-community/datetimepicker';
import {
    BookOpen,
    Briefcase,
    Calendar,
    Car,
    Coffee,
    DollarSign,
    Gift,
    HelpCircle,
    Landmark,
    PiggyBank,
    Shirt,
    Trash2,
    TrendingUp,
    X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EXPENSE_CATEGORIES, Transaction, TransactionType } from '../constants/types';

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (amount: number, category: string, note: string, date: Date, type: TransactionType, id?: string) => void;
    onDelete?: (id: string) => void;
    type: TransactionType;
    initialTransaction?: Transaction | null;
}

const INCOME_CATEGORIES = ['Salary', 'Business', 'Gift', 'Investment', 'Other'];

const getCategoryIcon = (category: string, type: TransactionType, size: number = 18) => {
    if (type === 'expense') {
        switch (category) {
            case 'Food and Drinks': return <Coffee size={size} color="white" />;
            case 'Education': return <BookOpen size={size} color="white" />;
            case 'Clothes': return <Shirt size={size} color="white" />;
            case 'Transportation': return <Car size={size} color="white" />;
            case 'Entertainment': return <Gift size={size} color="white" />;
            case 'Savings': return <PiggyBank size={size} color="white" />;
            default: return <HelpCircle size={size} color="white" />;
        }
    } else {
        switch (category) {
            case 'Salary': return <Briefcase size={size} color="white" />;
            case 'Business': return <TrendingUp size={size} color="white" />;
            case 'Gift': return <Gift size={size} color="white" />;
            case 'Investment': return <Landmark size={size} color="white" />;
            default: return <DollarSign size={size} color="white" />;
        }
    }
};

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
    visible,
    onClose,
    onSubmit,
    onDelete,
    type,
    initialTransaction
}) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    useEffect(() => {
        if (initialTransaction) {
            setAmount(initialTransaction.amount.toString());
            setCategory(initialTransaction.category);
            setNote(initialTransaction.note || '');
            setDate(new Date(initialTransaction.date));
        } else {
            resetForm();
        }
    }, [initialTransaction, visible]);

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
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
        setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
        setNote('');
        setDate(new Date());
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
                            <View className="flex-row items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <Text className="text-2xl font-bold text-slate-800 mr-2">₱</Text>
                                <TextInput
                                    className="flex-1 text-2xl font-bold text-slate-800"
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-slate-500 font-medium mb-2">Category</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setCategory(cat)}
                                        className={`px-4 py-2.5 rounded-full border items-center justify-center ${category === cat
                                                ? 'bg-indigo-600 border-indigo-600'
                                                : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <Text
                                            className={`font-medium ${category === cat ? 'text-white' : 'text-slate-600'
                                                }`}
                                        >
                                            {cat}
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
