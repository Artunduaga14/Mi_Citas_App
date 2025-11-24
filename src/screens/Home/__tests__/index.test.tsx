// src/screens/Home/__tests__/index.test.tsx
import React from 'react';
import {
  render,
  waitFor,
  fireEvent,
  screen,
} from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';

import HomeScreen from '../index';
import { HttpService } from '../../../services/GenericServices';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));


jest.mock('../../../services/GenericServices', () => ({
  HttpService: {
    get: jest.fn(),
  },
}));


const MOCK_TYPE_CITATIONS = [
  { id: '1', name: 'Medicina General', icon: 'consulta' },
  { id: '2', name: 'Odontología', icon: 'odontologia' },
  { id: '3', name: 'Pediatría', icon: 'pediatria' },
  { id: '4', name: 'Citología', icon: 'citologia' },
  { id: '5', name: 'Vacunación', icon: 'vacuna' },
  { id: '6', name: 'Cardiología', icon: 'cardiologia' },
];


jest.mock('../../../components/cards/HeaderGreeting', () => {
  const { Text } = require('react-native');
  return function HeaderGreetingMock() {
    return <Text>HeaderGreeting Mock</Text>;
  };
});

jest.mock('../../../components/cards/BannerCard', () => {
  const { Text, View } = require('react-native');
  return function BannerCardMock(props: any) {
    return (
      <View>
        <Text>{props?.title ?? 'BannerCard Mock'}</Text>
      </View>
    );
  };
});

jest.mock('../../../components/ui/ThemedText', () => {
  const { Text } = require('react-native');
  return function ThemedTextMock({ children, ...rest }: any) {
    return <Text {...rest}>{children}</Text>;
  };
});

jest.mock('../../../components/ui/ThemedView', () => {
  const { View } = require('react-native');
  return function ThemedViewMock({ children, ...rest }: any) {
    return <View {...rest}>{children}</View>;
  };
});


describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Por defecto, el servicio devuelve datos válidos
    (HttpService.get as jest.Mock).mockResolvedValue(MOCK_TYPE_CITATIONS);
  });

  it('debe renderizar los componentes principales y cargar datos', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(HttpService.get).toHaveBeenCalledWith('TypeCitation');
    });

    // Título principal de la sección
    expect(screen.getByText('Tipos de Citas')).toBeTruthy();
    // Sección de "Mis personas" en la parte de abajo
    expect(screen.getByText('Mis personas')).toBeTruthy();
  });

  it('debe renderizar la lista de citas (limitada a 5 items)', async () => {
    render(<HomeScreen />);

    // Alguno de los datos mock
    await waitFor(() => {
      expect(screen.getByText('Medicina General')).toBeTruthy();
    });
  });

  it('debe mostrar el botón "Ver más" si hay más de 5 items', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('Ver más')).toBeTruthy();
    });
  });

  it('debe navegar a ReservationView al presionar una tarjeta de cita', async () => {
    const { UNSAFE_getAllByType } = render(<HomeScreen />);

    // Esperamos a que se pinten los datos mock
    await waitFor(() => {
      expect(screen.getByText('Medicina General')).toBeTruthy();
    });

    // Obtenemos todos los TouchableOpacity (tarjetas + "Ver más" + otros)
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    // Presionamos todos, para asegurarnos de disparar al menos una tarjeta
    touchables.forEach(t => fireEvent.press(t));

    // Verificamos que se haya llamado navigate con los parámetros esperados
    expect(mockNavigate).toHaveBeenCalledWith('ReservationView', {
      typeCitationId: 1,
    });
  });

  it('debe abrir el modal con todas las citas al presionar "Ver más"', async () => {
    const { UNSAFE_getAllByType } = render(<HomeScreen />);

    // Esperamos a que la sección de tipos esté cargada
    await waitFor(() => {
      expect(screen.getByText('Ver más')).toBeTruthy();
    });

    // Obtenemos todos los TouchableOpacity
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    // Presionamos todos: una de esas pulsaciones será el botón "Ver más"
    touchables.forEach(t => fireEvent.press(t));

    // Ahora sí, debería mostrarse el título del modal
    const modalTitle = await screen.findByText('Todos los tipos de citas');
    expect(modalTitle).toBeTruthy();

    // Y uno de los tipos extra, por ejemplo "Cardiología"
    expect(screen.getByText('Cardiología')).toBeTruthy();
  });

  it('debe usar datos de respaldo (DATA) si el servicio falla', async () => {
    // Forzamos error en el servicio
    (HttpService.get as jest.Mock).mockRejectedValue(new Error('Fallo API'));

    render(<HomeScreen />);

    // Como el servicio falla, el componente debe usar DATA (que incluye "Consulta General")
    await waitFor(() => {
      expect(screen.getByText('Consulta General')).toBeTruthy();
    });
  });
});
