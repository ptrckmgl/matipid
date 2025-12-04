import { initDB } from "@/utils/db";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { cssInterop } from "nativewind";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CustomSplashScreen } from "../components/SplashScreen";
import { TransactionProvider } from "../context/TransactionContext";
import "../global.css";

cssInterop(LinearGradient, {
  className: {
    target: "style",
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <CustomSplashScreen />;
  }

  return (
    <SQLiteProvider databaseName="matipid.db" onInit={initDB} options={{ useNewConnection: false }}>
      <SafeAreaProvider>
        <TransactionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TransactionProvider>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
