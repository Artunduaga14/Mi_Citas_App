// src/components/common/__tests__/Collapsible.test.tsx
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { Collapsible } from "../Collapsible";

/** Mock de ThemedText para evitar problemas de estilos */
jest.mock("../../ui/ThemedText", () => {
  const { Text } = require("react-native");
  return (props: any) => <Text {...props}>{props.children}</Text>;
});

/** Mock de ThemedView para reducir complejidad */
jest.mock("../../ui/ThemedView", () => {
  const { View } = require("react-native");
  return (props: any) => <View {...props}>{props.children}</View>;
});

/** Mock de IconSymbol (evita crash por SVG nativos) */
jest.mock("../../ui/IconSymbol", () => {
  const { Text } = require("react-native");
  return {
    IconSymbol: ({ name }: any) => <Text testID="icon-symbol">{name}</Text>,
  };
});

/** Mock de useColorScheme */
jest.mock("../../../hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

describe("Collapsible Component", () => {
  it("debe renderizar el título correctamente", () => {
    render(<Collapsible title="Sección de prueba">Contenido</Collapsible>);

    expect(screen.getByText("Sección de prueba")).toBeTruthy();
  });

  it("debe iniciar cerrado (no renderiza el contenido)", () => {
    render(<Collapsible title="Mi título">Contenido secreto</Collapsible>);

    // Como está cerrado, NO debe existir el contenedor del contenido
    expect(screen.queryByTestId("collapsible-content")).toBeNull();
  });

  it("debe abrirse al presionar el header", () => {
    render(<Collapsible title="Mi título">Contenido secreto</Collapsible>);

    const header = screen.getByTestId("collapsible-header");

    fireEvent.press(header);

    // Ahora sí debería aparecer el contenedor del contenido
    expect(screen.getByTestId("collapsible-content")).toBeTruthy();
  });

  it("debe cerrarse nuevamente al presionar el header otra vez", () => {
    render(<Collapsible title="Mi título">Contenido secreto</Collapsible>);

    const header = screen.getByTestId("collapsible-header");

    // Abrir
    fireEvent.press(header);
    expect(screen.getByTestId("collapsible-content")).toBeTruthy();

    // Cerrar
    fireEvent.press(header);
    expect(screen.queryByTestId("collapsible-content")).toBeNull();
  });

  it("debe mostrar el icono", () => {
    render(<Collapsible title="Sección">Algo</Collapsible>);
    const icon = screen.getByTestId("icon-symbol");
    expect(icon).toBeTruthy();
  });
});
