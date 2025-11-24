import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { Text } from "react-native"; // 👈 IMPORTANTE
import RelatedPersonCard from "../RelatedPersonCard";

// 🧩 Mock de iconos (evita errores nativos)
jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: any) => <Text {...props}>Ion-{props.name}</Text>,
    MaterialCommunityIcons: (props: any) => (
      <Text {...props}>MCI-{props.name}</Text>
    ),
  };
});

// 🧩 Mock de ThemedText
jest.mock("../../ui/ThemedText", () => {
  const { Text } = require("react-native");
  return ({ children, ...props }: any) => (
    <Text {...props}>{children}</Text>
  );
});

const mockItem = {
  id: 1,
  personId: 10,
  fullName: "Juan Pérez",
  relation: "hermano",
  documentTypeName: "CC",
  document: "123456",
  active: true,
};

describe("RelatedPersonCard Component", () => {
  it("debe renderizar el nombre", () => {
    render(<RelatedPersonCard item={mockItem} />);

    expect(screen.getByText("Juan Pérez")).toBeTruthy();
  });

  it("debe renderizar el subtítulo (relación capitalizada)", () => {
    render(<RelatedPersonCard item={mockItem} />);

    expect(screen.getByText("Hermano")).toBeTruthy();
  });

  it("debe mostrar el tipo de documento", () => {
    render(<RelatedPersonCard item={mockItem} />);

    expect(screen.getByText("CC")).toBeTruthy();
  });

  it("debe mostrar el número de documento", () => {
    render(<RelatedPersonCard item={mockItem} />);

    expect(screen.getByText("123456")).toBeTruthy();
  });

  it("debe ejecutar onPressDetails correctamente", () => {
    const mockPress = jest.fn();

    render(<RelatedPersonCard item={mockItem} onPressDetails={mockPress} />);

    const detalleBtn = screen.getByText("Ver detalle");
    fireEvent.press(detalleBtn);

    expect(mockPress).toHaveBeenCalledTimes(1);
    expect(mockPress).toHaveBeenCalledWith(mockItem);
  });

  it("debe usar color personalizado si viene en el item", () => {
    const customItem = { ...mockItem, color: "#FF0000" };

    const { getByTestId } = render(<RelatedPersonCard item={customItem} />);

    const card = getByTestId("related-person-card");

    // Como styles.card + override se combinan en un array, usamos arrayContaining
    expect(card.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderBottomColor: "#FF0000" }),
      ])
    );
  });
});
