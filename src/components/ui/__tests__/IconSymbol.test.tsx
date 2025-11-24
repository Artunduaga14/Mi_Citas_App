// src/components/ui/__tests__/IconSymbol.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { IconSymbol } from "../IconSymbol";

// Mock de expo-symbols para evitar módulos nativos
jest.mock("expo-symbols", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    SymbolView: (props: any) => (
      <Text testID="icon-symbol" {...props}>
        {props.name}
      </Text>
    ),
  };
});

describe("IconSymbol Component", () => {
  it("debe renderizar un icono con el nombre, tamaño y color recibidos", () => {
    const { getByTestId } = render(
      <IconSymbol name="bell.fill" size={30} color="#ff0000" />
    );

    const icon = getByTestId("icon-symbol");

    // Nombre que recibe el SymbolView
    expect(icon.props.name).toBe("bell.fill");

    // Color (en tu implementación puede ir en tintColor o color)
    expect(icon.props.tintColor ?? icon.props.color).toBe("#ff0000");

    // Si IconSymbol aplica estilo con width/height, lo verificamos
    if (icon.props.style) {
      const style = Array.isArray(icon.props.style)
        ? Object.assign({}, ...icon.props.style)
        : icon.props.style;

      expect(style.width).toBe(30);
      expect(style.height).toBe(30);
    }
  });

  it("debe renderizar el icono aunque no se pase size (usa valor por defecto)", () => {
    const { getByTestId } = render(
      <IconSymbol name="heart.fill" color="#000000" />
    );

    const icon = getByTestId("icon-symbol");
    expect(icon.props.name).toBe("heart.fill");
    expect(icon.props.tintColor ?? icon.props.color).toBe("#000000");
  });
});
