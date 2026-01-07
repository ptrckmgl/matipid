import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BudgetStatus } from '../constants/types';
import { CategoryIcon } from './CategoryIcon';

interface BudgetCardProps {
    budgetStatus: BudgetStatus;
    onPress?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budgetStatus, onPress }) => {
    const { category, spent, budget, percentage, isExceeded, isWarning } = budgetStatus;

    // Determine progress bar color
    const getProgressColor = () => {
        if (isExceeded) return '#EF4444'; // red-500
        if (isWarning) return '#F59E0B'; // amber-500
        return '#10B981'; // emerald-500
    };

    const getProgressBgColor = () => {
        if (isExceeded) return '#FEE2E2'; // red-100
        if (isWarning) return '#FEF3C7'; // amber-100
        return '#D1FAE5'; // emerald-100
    };

    const progressColor = getProgressColor();
    const progressBgColor = getProgressBgColor();
    const displayPercentage = Math.min(percentage, 100);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
        >
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3">
                    <CategoryIcon
                        iconName={category.icon}
                        color="white"
                        size={18}
                        backgroundColor={category.color}
                    />
                    <Text className="text-slate-800 font-semibold text-base">{category.name}</Text>
                </View>
                <Text
                    className="font-bold text-sm"
                    style={{ color: progressColor }}
                >
                    {percentage.toFixed(0)}%
                </Text>
            </View>

            {/* Progress Bar */}
            <View
                className="h-2 rounded-full mb-2 overflow-hidden"
                style={{ backgroundColor: progressBgColor }}
            >
                <View
                    className="h-full rounded-full"
                    style={{
                        backgroundColor: progressColor,
                        width: `${displayPercentage}%`,
                    }}
                />
            </View>

            {/* Amount Info */}
            <View className="flex-row items-center justify-between">
                <Text className="text-slate-500 text-xs">
                    ₱{spent.toFixed(2)} / ₱{budget.limitAmount.toFixed(2)}
                </Text>
                {isExceeded && (
                    <Text className="text-red-500 text-xs font-semibold">Over Budget!</Text>
                )}
                {isWarning && !isExceeded && (
                    <Text className="text-amber-600 text-xs font-semibold">Approaching Limit</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};
