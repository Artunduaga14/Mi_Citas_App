import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MainNavigator from "../MainNavigator";

// 🧱 Mock de AsyncStorage para evitar el error NativeModule: AsyncStorage is null
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

// 🧱 Mock de AuthService para evitar llamadas reales
jest.mock("../../services/Auth/AuthService", () => ({
  __esModule: true,
  authService: {
    getToken: jest.fn().mockResolvedValue(null),
    getUserInfo: jest.fn().mockResolvedValue(null),
    logout: jest.fn(),
  },
}));

// 🧱 Mock muy sencillo de HeaderGreeting para que HomeScreen no reviente
jest.mock("../../components/cards/HeaderGreeting", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  return {
    __esModule: true,
    default: () => (
      <View testID="mock-header">
        <Text>Header</Text>
      </View>
    ),
  };
});

// 🧪 Helper para renderizar el navigator con los providers necesarios
const renderWithProviders = () =>
  render(
    <SafeAreaProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );

describe("MainNavigator", () => {
  test("se renderiza sin crashear", () => {
    const { toJSON } = renderWithProviders();

    // Si toJSON() no es null, significa que se renderizó algo
    expect(toJSON()).toBeTruthy();
  });

  test("puede montarse y desmontarse sin errores", () => {
    const { unmount } = renderWithProviders();

    // Desmontamos el árbol y verificamos que no lance errores
    expect(() => unmount()).not.toThrow();
  });
});
