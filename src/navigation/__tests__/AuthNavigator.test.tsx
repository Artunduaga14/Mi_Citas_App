import React from "react";
import { render } from "@testing-library/react-native";
import AuthNavigator from "../AuthNavigator";

// 🧪 Mock de createNativeStackNavigator
jest.mock("@react-navigation/native-stack", () => {
  return {
    createNativeStackNavigator: () => {
      const React = require("react");
      const { View, Text } = require("react-native");

      const Navigator = ({ children }: any) => (
        <View testID="mock-auth-navigator">{children}</View>
      );

      const Screen = ({ name }: any) => (
        <View testID={`mock-auth-screen-${name}`}>
          <Text>{name}</Text>
        </View>
      );

      return { Navigator, Screen };
    },
  };
});

// 🧪 Mock de LoginScreen (no será mostrado por el mock del Screen)
jest.mock("../../screens/Login/LoginScreen", () => {
  const { View, Text } = require("react-native");
  return () => (
    <View>
      <Text>MockedLoginScreen</Text>
    </View>
  );
});

describe("AuthNavigator Component", () => {
  it("debería renderizar correctamente el Stack Navigator y la pantalla Login", () => {
    const { getByTestId, getByText } = render(<AuthNavigator />);

    // Navigator existe
    expect(getByTestId("mock-auth-navigator")).toBeTruthy();

    // Existe la screen con nombre Login
    expect(getByTestId("mock-auth-screen-Login")).toBeTruthy();

    // Y se está renderizando el texto "Login" que proviene del mock del Screen
    expect(getByText("Login")).toBeTruthy();
  });
});
