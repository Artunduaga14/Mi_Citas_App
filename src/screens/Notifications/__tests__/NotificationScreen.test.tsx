import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import NotificationScreen from '../NotificationScreen';
import { HttpService } from '../../../services/GenericServices';
// Importamos el servicio que vamos a mockear para acceder a su versión simulada
import { notificationSocket } from '../../../services/socket/notification.socket';

// 1. Mock de Navegación
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// 2. Mock del Socket de Notificaciones (SOLUCIÓN DEL ERROR)
jest.mock('../../../services/socket/notification.socket', () => {
  // Importamos RxJS aquí adentro para evitar problemas de hoisting
  const { BehaviorSubject } = require('rxjs');
  const subject = new BehaviorSubject([]);
  
  return {
    notificationSocket: {
      notifications$: subject.asObservable(),
      // Exponemos el subject "privado" para poder emitir valores desde el test
      _mockSubject: subject, 
    },
  };
});

// 3. Mock del Servicio HTTP
jest.mock('../../../services/GenericServices', () => ({
  HttpService: {
    GetAllUsers: jest.fn(),
  },
}));

// 4. Mock de Iconos
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

describe('NotificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reiniciamos el subject a un array vacío antes de cada test
    (notificationSocket as any)._mockSubject.next([]);
    (HttpService.GetAllUsers as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('debe renderizar la lista de notificaciones correctamente', async () => {
    // A. PREPARACIÓN: Emitimos datos usando nuestra propiedad oculta _mockSubject
    const notificacionesPrueba = [
      { id: 1, title: 'Cita Médica', message: 'Tu cita es mañana', date: '10/10/2023' },
      { id: 2, title: 'Bienvenido', message: 'Gracias por registrarte', date: '01/10/2023' },
    ];
    
    // Emitimos los datos simulados
    (notificationSocket as any)._mockSubject.next(notificacionesPrueba);

    // B. EJECUCIÓN
    render(<NotificationScreen />);

    // C. VERIFICACIÓN
    await waitFor(() => {
      expect(screen.getByText('Cita Médica')).toBeTruthy();
      expect(screen.getByText('Tu cita es mañana')).toBeTruthy();
      expect(screen.getByText('Bienvenido')).toBeTruthy();
    });
  });

  it('debe llamar a GetAllUsers al iniciar', async () => {
    render(<NotificationScreen />);

    await waitFor(() => {
      expect(HttpService.GetAllUsers).toHaveBeenCalledWith('Notification');
    });
  });
});