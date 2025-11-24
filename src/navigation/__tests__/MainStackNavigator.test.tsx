// src/navigation/__tests__/MainStackNavigator.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ✅ Mock de AsyncStorage solo para este archivo
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// ✅ Mock de AuthService para que no haga llamadas reales
jest.mock("../../services/Auth/AuthService", () => ({
  authService: {
    getToken: jest.fn().mockResolvedValue(null),
    login: jest.fn(),
    logout: jest.fn(),
  },
}));


// ✅ Importamos el stack real
import MainStackNavigator from "../MainStackNavigator";

// Helper para renderizar con NavigationContainer + SafeAreaProvider
const renderWithProviders = () =>
  render(
    <SafeAreaProvider>
      <NavigationContainer>
        <MainStackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );

describe("MainStackNavigator", () => {
  it("se renderiza sin crashear dentro de NavigationContainer", () => {
    const { toJSON } = renderWithProviders();
    expect(toJSON()).toBeTruthy(); // Árbol renderizado correctamente
  });

  it("monta el stack correctamente (segunda comprobación básica)", () => {
    expect(() => renderWithProviders()).not.toThrow();
  });
});
