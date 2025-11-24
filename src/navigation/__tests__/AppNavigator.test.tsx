// src/navigation/__tests__/AppNavigator.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import AppNavigator from "../AppNavigator";

// 🧪 Mock de createNativeStackNavigator
jest.mock("@react-navigation/native-stack", () => {
  return {
    createNativeStackNavigator: () => {
      const React = require("react");
      const { View, Text } = require("react-native");

      const Navigator = ({ children }: any) => (
        <View testID="mock-navigator">{children}</View>
      );

      const Screen = ({ name }: any) => (
        <View testID={`mock-screen-${name}`}>
          <Text>{name}</Text>
        </View>
      );

      return { Navigator, Screen };
    },
  };
});

// 🧪 Mock simples de los navegadores internos (no los vamos a afirmar por texto)
jest.mock("../AuthNavigator", () => {
  const { View } = require("react-native");
  return () => <View testID="auth-navigator" />;
});

jest.mock("../MainNavigator", () => {
  const { View } = require("react-native");
  return () => <View testID="main-navigator" />;
});

describe("AppNavigator Component", () => {
  it("debería renderizar los Stack.Screen de Auth y Main", () => {
    const { getByTestId, getByText } = render(<AppNavigator />);

    // ✅ Existe el navigator principal
    expect(getByTestId("mock-navigator")).toBeTruthy();

    // ✅ Existen las screens por nombre
    expect(getByTestId("mock-screen-Auth")).toBeTruthy();
    expect(getByTestId("mock-screen-Main")).toBeTruthy();

    // ✅ El texto que pinta nuestro mock de Screen es el name: "Auth" y "Main"
    expect(getByText("Auth")).toBeTruthy();
    expect(getByText("Main")).toBeTruthy();
  });
});
