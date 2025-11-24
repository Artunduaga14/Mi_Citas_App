import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PersonProfile from '../PersonPerfil';
import { PersonService, CatalogService } from '../../../services/hospital/personServices';
import { authService } from '../../../services/Auth/AuthService';

// 1. Mock de Navegación
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockGetParent = jest.fn(); // Mock para getParent()

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    getParent: mockGetParent, // Necesario para el logout
    reset: mockReset,
    dispatch: jest.fn(),
  }),
}));

// 2. Mock de LinearGradient (Evita errores de UI nativa)
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

// 3. Mock de Iconos
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native'); // Importación aislada
  return {
    Ionicons: ({ name }: { name: string }) => <Text testID={name}>{name}</Text>,
  };
});

// 4. Mock de Servicios
jest.mock('../../../services/hospital/personServices', () => ({
  PersonService: {
    getById: jest.fn(),
    update: jest.fn(),
  },
  CatalogService: {
    getDocumentTypes: jest.fn(),
    getEps: jest.fn(),
  },
}));

jest.mock('../../../services/Auth/AuthService', () => ({
  authService: {
    getUserId: jest.fn(),
    logout: jest.fn(),
  },
}));

// 5. Mock del Formulario de Perfil (Opcional, para simplificar)
// Si quieres probar la integración real, puedes quitar esto, pero aislarlo suele ser mejor.
jest.mock('../../../components/Forms/personProfileForm', () => {
  const { View, Text, Button } = require('react-native');
  return (props: any) => (
    <View testID="mock-profile-form">
      <Text>Formulario de Edición</Text>
      <Button title="Guardar Mock" onPress={() => props.onSubmit(props.initial)} />
      <Button title="Cancelar Mock" onPress={props.onCancel} />
    </View>
  );
});

// Datos de prueba
const mockUser = {
  id: 1,
  fullName: 'Juan',
  fullLastName: 'Pérez',
  document: '12345678',
  documentTypeId: 1,
  documentTypeAcronymName: 'CC',
  dateBorn: '1990-01-01T00:00:00',
  phoneNumber: '3001234567',
  epsName: 'SaludTotal',
  epsId: 1,
  gender: 'masculino',
  healthRegime: 'contributivo',
};

describe('PersonProfile Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configuramos respuestas exitosas por defecto
    (authService.getUserId as jest.Mock).mockResolvedValue(1);
    (PersonService.getById as jest.Mock).mockResolvedValue(mockUser);
    (CatalogService.getDocumentTypes as jest.Mock).mockResolvedValue([]);
    (CatalogService.getEps as jest.Mock).mockResolvedValue([]);
    
    // Configurar el mock de navegación para logout
    mockGetParent.mockReturnValue({ reset: mockReset });
  });

  it('debe cargar y mostrar la información del usuario correctamente', async () => {
    render(<PersonProfile />);

    // Esperar a que desaparezca el loading y se muestren los datos
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeTruthy();
      expect(screen.getByText(/CC 12345678/)).toBeTruthy();
      expect(screen.getByText('SaludTotal')).toBeTruthy();
      expect(screen.getByText('3001234567')).toBeTruthy();
    });
    
    // Verificar que se llamaron los servicios
    expect(authService.getUserId).toHaveBeenCalled();
    expect(PersonService.getById).toHaveBeenCalledWith(1);
  });

  it('debe mostrar el menú al presionar los tres puntos', async () => {
    render(<PersonProfile />);
    await waitFor(() => screen.getByText('Juan Pérez')); // Esperar carga

    // Encontrar el botón de menú (podrías ponerle testID al TouchableOpacity en el componente real para ser más preciso)
    // Como no tenemos testID, buscamos por el icono, pero en tests es difícil hacer clic en iconos mockeados si no tienen accesibilidad.
    // Una estrategia mejor si no puedes modificar el código fuente es buscar por tipo o estructura, 
    // pero aquí asumiremos que puedes encontrar el elemento padre o agregamos un testID temporalmente.
    
    // NOTA: Si no quieres modificar tu código fuente, una forma robusta es buscar elementos.
    // Sin embargo, como mockeamos Ionicons como string 'Ionicons', React Test Library lo renderiza como texto.
    // Buscamos el texto 'ellipsis-vertical' que es el nombre del icono.
    const menuButton = screen.getAllByText('ellipsis-vertical')[0]; 
    fireEvent.press(menuButton);

    // Verificar que aparecen las opciones
    await waitFor(() => {
      expect(screen.getByText('Editar información')).toBeTruthy();
      expect(screen.getByText('Salir')).toBeTruthy();
    });
  });

  it('debe cerrar sesión y navegar al Auth stack al presionar Salir', async () => {
    render(<PersonProfile />);
    await waitFor(() => screen.getByText('Juan Pérez'));

    // Abrir menú
    const menuButton = screen.getAllByText('ellipsis-vertical')[0];
    fireEvent.press(menuButton);

    // Presionar Salir
    const logoutButton = await screen.findByText('Salir');
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      // Verificar navegación
      expect(mockGetParent).toHaveBeenCalled(); // Verifica que buscó el navegador padre
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    });
  });

  it('debe abrir el formulario de edición al presionar Editar', async () => {
    render(<PersonProfile />);
    await waitFor(() => screen.getByText('Juan Pérez'));

    // Abrir menú
    const menuButton = screen.getAllByText('ellipsis-vertical')[0];
    fireEvent.press(menuButton);

    // Presionar Editar
    const editButton = await screen.findByText('Editar información');
    fireEvent.press(editButton);

    // Verificar que aparece el mock del formulario
    await waitFor(() => {
      expect(screen.getByTestId('mock-profile-form')).toBeTruthy();
    });
  });
});