// src/components/animations/__tests__/HelloWave.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';

// ✅ Mock de react-native-reanimated para evitar problemas de animación en Jest
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // Fix para algunos warnings de la mock
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Importamos el componente a probar
import { HelloWave } from '../HelloWave';

describe('HelloWave', () => {
  it('debe renderizar el emoji de saludo 👋', () => {
    render(<HelloWave />);

    // Verificamos que el emoji esté en el árbol
    expect(screen.getByText('👋')).toBeTruthy();
  });
});
