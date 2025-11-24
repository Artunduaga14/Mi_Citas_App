import React from "react";
import { render } from "@testing-library/react-native";
import { IconSymbol } from "../IconSymbol.ios";

// 🔹 Mock de expo-symbols para evitar dependencias nativas
jest.mock("expo-symbols", () => {
  const { View, Text } = require("react-native");
  return {
    SymbolView: ({ name, tintColor, weight, style }: any) => (
      <View testID="symbol-view" style={style}>
        <Text testID="symbol-name">{name}</Text>
        <Text testID="symbol-color">{tintColor}</Text>
        <Text testID="symbol-weight">{weight}</Text>
      </View>
    ),
  };
});

describe("IconSymbol Component (iOS)", () => {
  it("debe renderizar el icono con el nombre correcto", () => {
    const { getByTestId } = render(
      <IconSymbol name="heart.fill" color="red" size={32} />
    );

    expect(getByTestId("symbol-name").props.children).toBe("heart.fill");
  });

  it("debe aplicar el color correctamente", () => {
    const { getByTestId } = render(
      <IconSymbol name="star" color="gold" size={24} />
    );

    expect(getByTestId("symbol-color").props.children).toBe("gold");
  });

  it("debe aplicar el tamaño correctamente", () => {
    const { getByTestId } = render(
      <IconSymbol name="sun.max" color="orange" size={40} />
    );

    const style = getByTestId("symbol-view").props.style;

    expect(style[0].width).toBe(40);
    expect(style[0].height).toBe(40);
  });

  it("debe permitir cambiar el peso del símbolo", () => {
    const { getByTestId } = render(
      <IconSymbol name="bolt" color="yellow" weight="bold" />
    );

    expect(getByTestId("symbol-weight").props.children).toBe("bold");
  });
});
