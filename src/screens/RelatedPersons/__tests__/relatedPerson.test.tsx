import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import { Alert, Text, View, TouchableOpacity } from 'react-native';
import RelatedPersonsScreen from '../relatedPerson';
import { HttpService } from '../../../services/GenericServices';

// 1. Mock de Navegación
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// 2. Mock de LinearGradient y Componentes de UI
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => <>{children}</>,
}));

// 3. Mock de Iconos (Igual que en Perfil para encontrar botones)
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => <Text testID={name}>{name}</Text>,
    MaterialCommunityIcons: ({ name }: { name: string }) => <Text testID={name}>{name}</Text>,
  };
});

// 4. Mock de Servicios
jest.mock('../../../services/GenericServices', () => ({
  HttpService: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

// 5. Mock de Componentes hijos complejos
// Mockeamos HeaderGreeting para simplificar
jest.mock('../../../components/cards/HeaderGreeting', () => {
  const { Text } = require('react-native');
  return () => <Text>HeaderGreeting Mock</Text>;
});

// Mockeamos el Modal de Persona Relacionada para verificar que se abre
jest.mock('../../../components/Forms/relatedPerson', () => {
  const { View, Text, Button } = require('react-native');
  return (props: any) => {
    if (!props.visible) return null;
    return (
      <View testID="mock-related-person-modal">
        <Text>Modal Persona Relacionada</Text>
        <Text>{props.mode === 'edit' ? 'Modo Edición' : 'Modo Creación'}</Text>
        <Button title="Guardar Mock" onPress={props.onSaved} />
        <Button title="Cerrar Mock" onPress={props.onClose} />
      </View>
    );
  };
});

// Datos de prueba
const mockRelatedPersons = [
  {
    id: 1,
    personId: 100,
    fullName: 'Maria Lopez',
    relation: 'Madre',
    documentTypeName: 'CC',
    document: '98765432',
    active: true,
  },
  {
    id: 2,
    personId: 100,
    fullName: 'Carlos Gomez',
    relation: 'Hermano',
    documentTypeName: 'TI',
    document: '11223344',
    active: true,
  },
];

describe('RelatedPersonsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar respuesta exitosa por defecto
    (HttpService.get as jest.Mock).mockResolvedValue(mockRelatedPersons);
    
    // Mockear alertas
    jest.spyOn(Alert, 'alert');
  });

  it('debe cargar y mostrar la lista de personas relacionadas', async () => {
    render(<RelatedPersonsScreen />);

    // Verificar que se llama al servicio
    await waitFor(() => {
      expect(HttpService.get).toHaveBeenCalledWith(expect.stringContaining('RelatedPerson'));
    });

    // Verificar que se muestran los datos
    await waitFor(() => {
      expect(screen.getByText('Maria Lopez')).toBeTruthy();
      expect(screen.getByText('Madre')).toBeTruthy(); // Capitalizado en el componente
      expect(screen.getByText('Carlos Gomez')).toBeTruthy();
      expect(screen.getByText('Hermano')).toBeTruthy();
    });
  });

  it('debe mostrar el botón de agregar persona', async () => {
    render(<RelatedPersonsScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Agregar persona')).toBeTruthy();
    });
  });

  it('debe abrir el modal en modo creación al presionar "Agregar persona"', async () => {
    render(<RelatedPersonsScreen />);
    
    await waitFor(() => screen.getByText('Agregar persona'));
    
    const addButton = screen.getByText('Agregar persona');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('mock-related-person-modal')).toBeTruthy();
      expect(screen.getByText('Modo Creación')).toBeTruthy();
    });
  });

  it('debe abrir el modal en modo edición al usar el menú de editar', async () => {
    render(<RelatedPersonsScreen />);
    await waitFor(() => screen.getByText('Maria Lopez'));

    // 1. Abrir el menú de la tarjeta (buscamos el icono de tres puntos)
    // Nota: Como hay varios items, getAllByText devolverá un array. Usamos el primero.
    const menuButtons = screen.getAllByText('ellipsis-vertical');
    fireEvent.press(menuButtons[0]); 

    // 2. Buscar y presionar la opción "Editar" del menú desplegable
    const editOption = await screen.findByText('Editar');
    fireEvent.press(editOption);

    // 3. Verificar que el modal se abre en modo edición
    await waitFor(() => {
      expect(screen.getByTestId('mock-related-person-modal')).toBeTruthy();
      expect(screen.getByText('Modo Edición')).toBeTruthy();
    });
  });

  it('debe intentar eliminar una persona al usar el menú de eliminar', async () => {
    render(<RelatedPersonsScreen />);
    await waitFor(() => screen.getByText('Maria Lopez'));

    // 1. Abrir menú
    const menuButtons = screen.getAllByText('ellipsis-vertical');
    fireEvent.press(menuButtons[0]);

    // 2. Presionar Eliminar
    const deleteOption = await screen.findByText('Eliminar');
    fireEvent.press(deleteOption);

    // 3. Verificar que sale la alerta de confirmación
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
      // Comprobamos que la alerta contiene el nombre de la persona a eliminar
      expect(Alert.alert).toHaveBeenCalledWith(
        'Eliminar',
        expect.stringContaining('Maria Lopez'),
        expect.any(Array)
      );
    });
  });
});