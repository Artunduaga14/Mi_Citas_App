import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainNavigator from "./MainNavigator";
import PersonProfile from "../screens/Perfil/PersonPerfil";

const Stack = createNativeStackNavigator();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 👇 Este es tu bottom tab principal */}
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      
      {/* 👇 Esta pantalla ya NO está en el tab, pero es navegable */}
      <Stack.Screen name="Perfil" component={PersonProfile} />
    </Stack.Navigator>
  );
}
