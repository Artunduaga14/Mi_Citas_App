// src/components/ui/__tests__/TabBarBackground.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import TabBarBackground from "../TabBarBackground";

// Mock muy simple de expo-blur para que en test se comporte como un View
jest.mock("expo-blur", () => {
  const { View } = require("react-native");
  return {
    BlurView: (props: any) => <View {...props} />,
  };
});

describe("TabBarBackground Component", () => {
  it("debe renderizarse sin errores", () => {
    const { toJSON } = render(<TabBarBackground />);
    const tree = toJSON();

    // Solo comprobamos que algo se renderiza
    expect(tree).toBeTruthy();
  });

  it("puede renderizarse varias veces sin errores", () => {
    const firstRender = render(<TabBarBackground />);
    const secondRender = render(<TabBarBackground />);

    expect(firstRender.toJSON()).toBeTruthy();
    expect(secondRender.toJSON()).toBeTruthy();
  });
});
