// src/components/cards/__tests__/AppointmentTypeCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react-native";
import AppointmentTypeCard from "../AppointmentTypeCard";

describe("AppointmentTypeCard", () => {
  it("debe renderizar la imagen y el label", () => {
    const mockImage = { uri: "test-image.png" };

    render(<AppointmentTypeCard image={mockImage} label="Odontología" />);

    // Verifica que la imagen (ImageBackground) está en el árbol
    expect(screen.getByTestId("appointment-type-image")).toBeTruthy();

    // Verifica que el label aparece
    expect(screen.getByText("Odontología")).toBeTruthy();
  });

  it("debe renderizar un TouchableOpacity como contenedor principal", () => {
    const mockImage = { uri: "test.png" };

    const { getByTestId } = render(
      <AppointmentTypeCard image={mockImage} label="Medicina" />
    );

    const touchable = getByTestId("appointment-type-card");
    expect(touchable).toBeTruthy();
  });
});
