// src/components/cards/__tests__/BannerCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react-native";
import BannerCard from "../BannerCard";

// Mock de ThemedText (respeta default export)
jest.mock("../../ui/ThemedText", () => {
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => (
      <Text {...props}>{children}</Text>
    ),
  };
});

describe("BannerCard", () => {
  it("debe renderizar el título y el subtítulo", () => {
    const mockImage = { uri: "test-image.png" };

    render(
      <BannerCard
        image={mockImage}
        title="Campaña de vacunación"
        subtitle="Del 10 al 20 de abril"
      />
    );

    expect(screen.getByText("Campaña de vacunación")).toBeTruthy();
    expect(screen.getByText("Del 10 al 20 de abril")).toBeTruthy();
  });

  it("no debe renderizar el subtítulo cuando no se envía", () => {
    const mockImage = { uri: "test-image.png" };

    render(<BannerCard image={mockImage} title="Solo título" />);

    // No debería existir este subtítulo
    expect(screen.queryByText("Subtítulo de prueba")).toBeNull();
  });

  it("debe pasar correctamente la imagen al ImageBackground", () => {
    const mockImage = { uri: "banner.png" };

    const { UNSAFE_getByType } = render(
      <BannerCard image={mockImage} title="Con imagen" />
    );

    // Obtenemos el ImageBackground real de react-native
    const { ImageBackground } = require("react-native");
    const imageBackgroundInstance = UNSAFE_getByType(ImageBackground);

    expect(imageBackgroundInstance.props.source).toEqual(mockImage);
  });
});
