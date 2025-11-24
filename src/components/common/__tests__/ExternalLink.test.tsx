import React from "react";
import { Text, Platform } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ExternalLink } from "../ExternalLink";
import { openBrowserAsync } from "expo-web-browser";

// 🔹 Mock de expo-web-browser
jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn(),
}));

// 🔹 Mock de expo-router -> Link
jest.mock("expo-router", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return {
    Link: ({ children, onPress, ...rest }: any) => (
      <TouchableOpacity
        {...rest}
        testID="external-link"
        onPress={() => {
          // Evento simulado con preventDefault
          const event = { preventDefault: jest.fn() };
          if (onPress) {
            onPress(event);
          }
        }}
      >
        {children || <Text>Link</Text>}
      </TouchableOpacity>
    ),
  };
});

describe("ExternalLink Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe abrir el navegador al hacer click cuando NO estamos en web", async () => {
    // Forzamos que la plataforma NO sea web
    (Platform as any).OS = "ios";

    const { getByTestId } = render(
      <ExternalLink href="https://google.com">
        <Text>Ir a Google</Text>
      </ExternalLink>
    );

    const link = getByTestId("external-link");
    fireEvent.press(link);

    await waitFor(() => {
      expect(openBrowserAsync).toHaveBeenCalledWith("https://google.com");
    });
  });

  it("NO debe abrir el navegador cuando estamos en web", async () => {
    // Simulamos entorno web
    (Platform as any).OS = "web";
    (openBrowserAsync as jest.Mock).mockClear();

    const { getByTestId } = render(
      <ExternalLink href="https://google.com">
        <Text>Ir a Google</Text>
      </ExternalLink>
    );

    const link = getByTestId("external-link");
    fireEvent.press(link);

    // En web no se llama a openBrowserAsync
    await waitFor(() => {
      expect(openBrowserAsync).not.toHaveBeenCalled();
    });
  });
});
