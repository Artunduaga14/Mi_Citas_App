// src/components/cards/__tests__/HeaderGreeting.test.tsx
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import HeaderGreeting from '../HeaderGreeting';
import { authService } from '../../../services/Auth/AuthService';

// 👇 fuera del describe, para usarlo en el mock de navegación
const mockReset = jest.fn();

// Mock de navegación
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    reset: mockReset,
  }),
  useRoute: () => ({ name: 'Home' }),
}));

// Mock del store de notificaciones
jest.mock('../../ui/notificationStore', () => ({
  notificationStore: {
    unreadCount$: {
      subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
    },
  },
}));

// Mock del authService
jest.mock('../../../services/Auth/AuthService', () => ({
  authService: {
    getUserId: jest.fn().mockReturnValue('1'),
    logout: jest.fn().mockResolvedValue(undefined),
    getUserDetails: jest.fn().mockResolvedValue({
      fullName: 'Juan',
      fullLastName: 'Pérez',
    }),
  },
}));

// (si tienes mocks / otros tests arriba, déjalos como están)

describe('HeaderGreeting Component', () => {
  // ...tus otros tests (renderiza saludo, etc.)

  it('debe ejecutar logout correctamente', async () => {
    // 🔹 Simulamos que el usuario CONFIRMA el Alert
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons) => {
        const btns = buttons as any[];
        // buscamos el botón "Cerrar sesión" o usamos el segundo
        const confirmBtn =
          btns.find((b) => b.text === 'Cerrar sesión') ?? btns[1];
        if (confirmBtn && confirmBtn.onPress) {
          confirmBtn.onPress();
        }
      });

    render(<HeaderGreeting />);

    // IMPORTANTE: en HeaderGreeting.tsx añade testID al botón:
    // <TouchableOpacity onPress={handleLogout} testID="logout-button">
    const logoutButton = screen.getByTestId('logout-button');

    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    });

    alertSpy.mockRestore();
  });
});
