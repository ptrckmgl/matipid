import {
    BookOpen,
    Briefcase,
    Car,
    Coffee,
    DollarSign,
    Gift,
    HelpCircle,
    Landmark,
    LucideIcon,
    PiggyBank,
    Shirt,
    TrendingUp,
} from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface CategoryIconProps {
    iconName: string;
    color: string;
    size?: number;
    backgroundColor?: string;
}

const iconMap: Record<string, LucideIcon> = {
    Coffee,
    BookOpen,
    Shirt,
    Car,
    Gift,
    PiggyBank,
    HelpCircle,
    Briefcase,
    TrendingUp,
    Landmark,
    DollarSign,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
    iconName,
    color,
    size = 20,
    backgroundColor,
}) => {
    const IconComponent = iconMap[iconName] || HelpCircle;

    if (backgroundColor) {
        return (
            <View
                className="rounded-full items-center justify-center"
                style={{
                    backgroundColor,
                    width: size * 2,
                    height: size * 2,
                }}
            >
                <IconComponent size={size} color={color} />
            </View>
        );
    }

    return <IconComponent size={size} color={color} />;
};
