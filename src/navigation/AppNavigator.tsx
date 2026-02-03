import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import DashboardScreen from "../screens/DashboardScreen";

import { getSession, isProbablyValidToken } from "../storage/secure";

export type RootStackParamList = {
  Login: undefined;
  Otp: { userid: string };
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function BootLoader() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

export default function AppNavigator() {
  const [booting, setBooting] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      const ok = !!session && isProbablyValidToken(session.token);
      setIsAuthed(ok);
      setBooting(false);
    })();
  }, []);

  const initialRoute = useMemo<keyof RootStackParamList>(() => {
    return isAuthed ? "Dashboard" : "Login";
  }, [isAuthed]);

  if (booting) return <BootLoader />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* Public routes */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />

        {/* Protected route */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            gestureEnabled: false, // reduces back-gesture risk
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
