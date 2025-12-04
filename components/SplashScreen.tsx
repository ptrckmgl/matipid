import { LinearGradient } from 'expo-linear-gradient';
import { Wallet } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

export const CustomSplashScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            className="flex-1 justify-center items-center"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                }}
                className="items-center"
            >
                <View className="w-[120px] h-[120px] rounded-[30px] bg-white/20 justify-center items-center mb-6 border-2 border-white/30">
                    <Wallet size={80} color="white" strokeWidth={2} />
                </View>
                <Text className="text-[32px] font-bold text-white mb-2">Expense Tracker</Text>
                <Text className="text-base text-white/90 font-medium">Manage your finances with ease</Text>
            </Animated.View>
        </LinearGradient>
    );
};
