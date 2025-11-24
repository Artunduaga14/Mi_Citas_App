import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
// Importamos ReservationView como exportación nombrada
import { ReservationView } from '../ReservationView';
import { authService } from '../../../services/Auth/AuthService';
import { coreCitationService } from '../../../services/socket/coreCitation.service';
import { socketService } from '../../../services/socket/socket.service';
import { Dialog, Toast } from 'react-native-alert-notification';
import { Text } from 'react-native';

// 1. Mocks de Navegación
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: { typeCitationId: 123 }, // Simulamos que recibimos un ID
  }),
}));

// 2. Mock de Iconos
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text testID={name}>{name}</Text>,
  };
});

// 3. Mock de Alertas
jest.mock('react-native-alert-notification', () => ({
  ALERT_TYPE: {
    DANGER: 'DANGER',
    WARNING: 'WARNING',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
  },
  Dialog: {
    show: jest.fn(),
    hide: jest.fn(),
  },
  Toast: {
    show: jest.fn(),
    hide: jest.fn(),
  },
}));

// 4. Mock de Servicios
jest.mock('../../../services/Auth/AuthService', () => ({
  authService: {
    getToken: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

jest.mock('../../../services/socket/coreCitation.service', () => ({
  coreCitationService: {
    getAvailableBlocks: jest.fn(),
  },
}));

// 5. Mock del Socket Service con RxJS manejado internamente
jest.mock('../../../services/socket/socket.service', () => {
  const { BehaviorSubject } = require('rxjs');
  const subject = new BehaviorSubject([]); // Inicialmente vacío

  return {
    socketService: {
      // Al llamar a setBlocks, actualizamos el subject para que el componente reaccione
      setBlocks: jest.fn((list) => {
        subject.next(list);
      }),
      connect: jest.fn(),
      joinDay: jest.fn(),
      leaveDay: jest.fn(),
      lock: jest.fn(),
      unlock: jest.fn(),
      confirm: jest.fn(),
      blocksChanges$: subject.asObservable(),
      _mockSubject: subject, 
    },
  };
});

// Datos de prueba (Horarios simulados)
const mockBlocks = [
  { hora: '08:00', estaDisponible: true },
  { hora: '09:00', estaDisponible: false }, // Ocupado
  { hora: '10:00', estaDisponible: true },
];

describe('ReservationView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Resetear el subject del socket usando la propiedad oculta
    (socketService as any)._mockSubject.next([]);

    // Configuración por defecto de los mocks
    (authService.getToken as jest.Mock).mockResolvedValue('fake-token-123');
    (authService.isAuthenticated as jest.Mock).mockResolvedValue(true);
    (coreCitationService.getAvailableBlocks as jest.Mock).mockResolvedValue(mockBlocks);
    (socketService.connect as jest.Mock).mockResolvedValue(true);
    (socketService.lock as jest.Mock).mockResolvedValue({ locked: true }); 
    (socketService.confirm as jest.Mock).mockResolvedValue({ success: true }); 
  });

  it('debe cargar y renderizar la lista de horarios disponibles', async () => {
    render(<ReservationView />);

    // Verificar carga de datos iniciales
    await waitFor(() => {
      expect(coreCitationService.getAvailableBlocks).toHaveBeenCalledWith(123, expect.any(String), true);
    });

    // Verificar conexión al socket
    expect(socketService.connect).toHaveBeenCalledWith('fake-token-123');
    
    // Verificar renderizado de las tarjetas de horario
    await waitFor(() => {
      expect(screen.getByText(/8:00 AM/)).toBeTruthy(); 
      expect(screen.getByText(/9:00 AM/)).toBeTruthy();
      
      // CORRECCIÓN: Usamos getAllByText porque hay múltiples "Disponible"
      const disponibles = screen.getAllByText('Disponible');
      expect(disponibles.length).toBeGreaterThan(0);
    });
  });

  it('debe mostrar alerta de error si no hay sesión válida', async () => {
    // Simulamos usuario no autenticado
    (authService.isAuthenticated as jest.Mock).mockResolvedValue(false); 

    render(<ReservationView />);

    await waitFor(() => {
      expect(Dialog.show).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sesión inválida',
        type: 'DANGER'
      }));
    });
  });

  it('debe intentar reservar un horario disponible al hacer clic', async () => {
    render(<ReservationView />);
    await waitFor(() => screen.getByText(/8:00 AM/)); // Esperar a que cargue

    const slotButton = screen.getByText(/8:00 AM/);
    fireEvent.press(slotButton);

    await waitFor(() => {
      // 1. Se intenta bloquear el slot
      expect(socketService.lock).toHaveBeenCalledWith('08:00');
      
      // 2. Se muestra el diálogo de confirmación
      expect(Dialog.show).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Confirmar cita',
        type: 'INFO',
      }));
    });
  });

  it('debe manejar el caso de slot ocupado (lock fallido)', async () => {
    // Simulamos que el lock falla (otro usuario ganó el cupo)
    (socketService.lock as jest.Mock).mockResolvedValue({ locked: false });

    render(<ReservationView />);
    await waitFor(() => screen.getByText(/10:00 AM/));

    const slotButton = screen.getByText(/10:00 AM/);
    fireEvent.press(slotButton);

    await waitFor(() => {
      expect(socketService.lock).toHaveBeenCalledWith('10:00');
      // Debe mostrar alerta de error
      expect(Dialog.show).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Horario ocupado',
        type: 'DANGER',
      }));
    });
  });

  it('debe confirmar la cita cuando el usuario acepta en el diálogo', async () => {
    // Mockeamos Dialog.show para simular que el usuario presiona "Sí" inmediatamente
    (Dialog.show as jest.Mock).mockImplementation(({ onPressButton }) => {
      onPressButton(); 
    });

    render(<ReservationView />);
    await waitFor(() => screen.getByText(/8:00 AM/));

    const slotButton = screen.getByText(/8:00 AM/);
    fireEvent.press(slotButton);

    await waitFor(() => {
      // Verificar que se llamó a confirmar al socket
      expect(socketService.confirm).toHaveBeenCalledWith('08:00');
      
      // Verificar mensaje de éxito
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
        title: '¡Éxito!',
        type: 'SUCCESS',
      }));
    });
  });
});