// src/components/animations/__tests__/ParallaxScrollView.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

// 🔁 Mock básico de react-native-reanimated para que Jest no explote
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // Fix para evitar errores de "call" en la mock
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Importamos el componente a probar
import ParallaxScrollView from '../ParallaxScrollView';

describe('ParallaxScrollView', () => {
  it('debe renderizar el header y el contenido', () => {
    render(
      <ParallaxScrollView
        headerImage={<Text testID="header-text">HEADER</Text>}
        headerBackgroundColor={{ light: '#fff', dark: '#000' }}
      >
        <Text testID="body-text">BODY</Text>
      </ParallaxScrollView>
    );

    // El header que pasamos por props
    expect(screen.getByTestId('header-text')).toBeTruthy();

    // El contenido (children)
    expect(screen.getByTestId('body-text')).toBeTruthy();
  });
});
