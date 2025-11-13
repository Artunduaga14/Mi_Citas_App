
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProtectedNavigator from "./ProtectedNavigator";
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Protected" component={ProtectedNavigator} />
    </Stack.Navigator>
  );
}