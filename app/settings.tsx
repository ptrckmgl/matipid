import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryIcon } from '../components/CategoryIcon';
import { ManageCategoryModal } from '../components/ManageCategoryModal';
import { Category, TransactionType } from '../constants/types';
import { useCategories } from '../context/CategoryContext';


export default function SettingsScreen() {
    const router = useRouter();
    const db = useSQLiteContext();
    const { categories, expenseCategories, incomeCategories } = useCategories();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modalType, setModalType] = useState<TransactionType>('expense');

    const handleAddCategory = (type: TransactionType) => {
        setSelectedCategory(null);
        setModalType(type);
        setModalVisible(true);
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setModalType(category.type);
        setModalVisible(true);
    };





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
                    <Text className="text-2xl font-bold text-slate-800">Settings</Text>
                </View>

                {/* Categories Section */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-slate-800 mb-4">Categories</Text>

                    {/* Expense Categories */}
                    <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-slate-600 font-semibold">Expense Categories</Text>
                            <TouchableOpacity
                                onPress={() => handleAddCategory('expense')}
                                className="flex-row items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full"
                            >
                                <Plus size={16} color="#6366F1" />
                                <Text className="text-indigo-600 font-medium text-sm">Add</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="gap-2">
                            {expenseCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => handleEditCategory(cat)}
                                    className="flex-row items-center justify-between p-3 bg-slate-50 rounded-xl"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <CategoryIcon iconName={cat.icon} color="white" size={16} backgroundColor={cat.color} />
                                        <Text className="text-slate-800 font-medium">{cat.name}</Text>
                                    </View>
                                    <ChevronRight size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Income Categories */}
                    <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-slate-600 font-semibold">Income Categories</Text>
                            <TouchableOpacity
                                onPress={() => handleAddCategory('income')}
                                className="flex-row items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full"
                            >
                                <Plus size={16} color="#6366F1" />
                                <Text className="text-indigo-600 font-medium text-sm">Add</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="gap-2">
                            {incomeCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => handleEditCategory(cat)}
                                    className="flex-row items-center justify-between p-3 bg-slate-50 rounded-xl"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <CategoryIcon iconName={cat.icon} color="white" size={16} backgroundColor={cat.color} />
                                        <Text className="text-slate-800 font-medium">{cat.name}</Text>
                                    </View>
                                    <ChevronRight size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>



                {/* App Info */}
                <View className="mb-8">
                    <Text className="text-lg font-bold text-slate-800 mb-4">About</Text>
                    <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <Text className="text-slate-600 font-semibold mb-2">Matipid</Text>
                        <Text className="text-slate-500 text-sm">Version 1.0.0</Text>
                        <Text className="text-slate-500 text-sm mt-2">
                            A simple and beautiful expense tracker to help you manage your finances.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <ManageCategoryModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedCategory(null);
                }}
                initialCategory={selectedCategory}
                type={modalType}
            />
        </SafeAreaView>
    );
}
