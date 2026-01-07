import { Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Category, TransactionType } from '../constants/types';
import { useCategories } from '../context/CategoryContext';
import { CategoryIcon } from './CategoryIcon';

interface ManageCategoryModalProps {
    visible: boolean;
    onClose: () => void;
    initialCategory?: Category | null;
    type: TransactionType;
}

const AVAILABLE_COLORS = [
    '#F97316', // orange
    '#3B82F6', // blue
    '#A855F7', // purple
    '#EF4444', // red
    '#EC4899', // pink
    '#10B981', // emerald
    '#64748B', // slate
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#F59E0B', // amber
    '#14B8A6', // teal
    '#06B6D4', // cyan
];

const AVAILABLE_ICONS = [
    'Coffee',
    'BookOpen',
    'Shirt',
    'Car',
    'Gift',
    'PiggyBank',
    'HelpCircle',
    'Briefcase',
    'TrendingUp',
    'Landmark',
    'DollarSign',
];

export const ManageCategoryModal: React.FC<ManageCategoryModalProps> = ({
    visible,
    onClose,
    initialCategory,
    type,
}) => {
    const { addCategory, updateCategory, deleteCategory } = useCategories();
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (initialCategory) {
            setName(initialCategory.name);
            setSelectedColor(initialCategory.color);
            setSelectedIcon(initialCategory.icon);
        } else {
            resetForm();
        }
    }, [initialCategory, visible]);

    const resetForm = () => {
        setName('');
        setSelectedColor(AVAILABLE_COLORS[0]);
        setSelectedIcon(AVAILABLE_ICONS[0]);
        setError(false);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError(true);
            return;
        }

        try {
            if (initialCategory) {
                await updateCategory(initialCategory.id, name.trim(), selectedColor, selectedIcon);
            } else {
                await addCategory(name.trim(), type, selectedColor, selectedIcon);
            }
            resetForm();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save category. Please try again.');
        }
    };

    const handleDelete = () => {
        if (!initialCategory) return;

        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${initialCategory.name}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCategory(initialCategory.id);
                            onClose();
                        } catch (error: any) {
                            Alert.alert('Cannot Delete', error.message || 'This category is being used in transactions.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-[32px] p-6 h-[85%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-bold text-slate-800">
                            {initialCategory ? 'Edit' : 'Add'} Category
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
                            <X size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="mb-6">
                            <Text className="text-slate-500 font-medium mb-2">Category Name</Text>
                            <TextInput
                                className={`flex-1 ${error ? 'text-base italic text-slate-800 opacity-70' : 'text-slate-800 font-medium'}`}
                                placeholder={error ? "*Required*" : "Enter category name"}
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    if (text) setError(false);
                                }}
                                placeholderTextColor={error ? "#EF4444" : "#94A3B8"}
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-slate-500 font-medium mb-2">Type</Text>
                            <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <Text className="text-slate-800 font-medium capitalize">{type}</Text>
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-slate-500 font-medium mb-3">Color</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {AVAILABLE_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setSelectedColor(color)}
                                        className={`w-12 h-12 rounded-full items-center justify-center ${selectedColor === color ? 'border-4 border-indigo-600' : 'border-2 border-slate-200'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {selectedColor === color && (
                                            <View className="w-3 h-3 bg-white rounded-full" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="mb-8">
                            <Text className="text-slate-500 font-medium mb-3">Icon</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {AVAILABLE_ICONS.map((icon) => (
                                    <TouchableOpacity
                                        key={icon}
                                        onPress={() => setSelectedIcon(icon)}
                                        className={`p-3 rounded-2xl border ${selectedIcon === icon
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <CategoryIcon
                                            iconName={icon}
                                            color={selectedIcon === icon ? 'white' : selectedColor}
                                            size={24}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="gap-4 mb-8">
                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-indigo-600 p-4 rounded-2xl items-center shadow-lg shadow-indigo-200"
                            >
                                <Text className="text-white font-bold text-lg">
                                    {initialCategory ? 'Update' : 'Add'} Category
                                </Text>
                            </TouchableOpacity>

                            {initialCategory && (
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    className="flex-row items-center justify-center bg-red-50 p-4 rounded-2xl border border-red-100"
                                >
                                    <Trash2 size={20} color="#EF4444" style={{ marginRight: 8 }} />
                                    <Text className="text-red-500 font-bold text-lg">Delete Category</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
