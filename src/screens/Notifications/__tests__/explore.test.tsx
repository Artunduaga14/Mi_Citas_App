import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ExploreScreen from '../explore'; 

// 1. Mock de Navegación
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// 2. Mock de AuthService (SOLUCIÓN: Agregamos getUserId)
jest.mock('../../../services/Auth/AuthService', () => ({
  authService: {
    getUserId: jest.fn().mockResolvedValue(123), // Simulamos que devuelve un ID 123
  },
}));

// 3. Mock de HttpService para evitar llamadas reales a la API
jest.mock('../../../services/GenericServices', () => ({
  HttpService: {
    get: jest.fn().mockResolvedValue([]), // Simulamos respuesta vacía por defecto
  },
}));

// 4. Mock de componentes hijos complejos para aislar la prueba (Opcional pero recomendado)
// Esto evita errores si HeaderGreeting o AppointmentCard usan otros contextos
jest.mock('../../../components/cards/HeaderGreeting', () => 'HeaderGreeting');
jest.mock('../../../components/cards/AppointmentCard', () => 'AppointmentCard');

describe('ExploreScreen', () => {
  it('debe renderizarse sin errores', async () => {
    const { toJSON } = render(<ExploreScreen />);
    
    // Esperamos a que cualquier efecto asíncrono inicial termine
    await waitFor(() => {
        expect(toJSON()).toBeTruthy();
    });
  });
});