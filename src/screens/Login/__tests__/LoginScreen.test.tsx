import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../LoginScreen';

// 1. Importamos los servicios que tu pantalla usa
// Ajusta la ruta si es necesario, basándote en tu estructura de carpetas
import { HttpService } from '../../../services/GenericServices';
import { authService } from '../../../services/Auth/AuthService';

// 2. Mock de la Navegación (Para que no falle useNavigation)
const mockNavigate = jest.fn(); // Espía para navigate
const mockReset = jest.fn();    // Espía para reset

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    reset: mockReset,
  }),
}));

// 3. Mock de HttpService (Para simular la petición al backend)
jest.mock('../../../services/GenericServices', () => ({
  HttpService: {
    login: jest.fn(), // Creamos la función falsa
    forgotPassword: jest.fn(),
  },
}));

// 4. Mock de AuthService (Para simular el guardado de tokens)
jest.mock('../../../services/Auth/AuthService', () => ({
  authService: {
    setTokens: jest.fn(), // Creamos la función falsa
    getUserId: jest.fn(),
  },
}));

// 5. Espía para las Alertas (Para verificar que salgan)
jest.spyOn(Alert, 'alert');

// Silenciar console.error para que el test de fallo no ensucie la terminal
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar datos antes de cada test
  });

  it('debe hacer login correctamente cuando el usuario y contraseña están bien', async () => {
    // A. PREPARACIÓN: Configuramos qué deben responder los servicios falsos
    const respuestaExitosa = {
      data: {
        accessToken: 'token-falso-123',
        refreshToken: 'refresh-falso-123'
      }
    };
    
    // Decimos: "Cuando llamen a login, responde esto"
    (HttpService.login as jest.Mock).mockResolvedValue(respuestaExitosa);
    // Decimos: "Cuando llamen a setTokens, di que todo salió bien"
    (authService.setTokens as jest.Mock).mockResolvedValue(true);

    // B. EJECUCIÓN: Renderizamos la pantalla
    render(<LoginScreen />);

    // Buscamos los campos (asegúrate que los placeholders coincidan con tu HTML)
    const inputCorreo = screen.getByPlaceholderText(/correo electrónico/i);
    const inputPass = screen.getByPlaceholderText(/contraseña/i);
    const botonIngresar = screen.getByText('Iniciar sesión');

    // Simulamos que el usuario escribe
    fireEvent.changeText(inputCorreo, 'usuario@prueba.com');
    fireEvent.changeText(inputPass, '123456');
    
    // Simulamos el clic en el botón
    fireEvent.press(botonIngresar);

    // C. VERIFICACIÓN: Comprobamos que todo pasó como esperábamos
    await waitFor(() => {
      // 1. ¿Se llamó al servicio HTTP con los datos correctos?
      expect(HttpService.login).toHaveBeenCalledWith('user', {
        email: 'usuario@prueba.com',
        password: '123456'
      });

      // 2. ¿Se intentaron guardar los tokens?
      expect(authService.setTokens).toHaveBeenCalledWith('token-falso-123', 'refresh-falso-123');

      // 3. ¿Salió la alerta de éxito?
      expect(Alert.alert).toHaveBeenCalledWith('✅ Login correcto', 'Bienvenido');
    });
  });

  it('debe mostrar error si el servicio falla', async () => {
    // A. PREPARACIÓN: Simulamos un error
    const error = new Error('Error de red');
    (HttpService.login as jest.Mock).mockRejectedValue(error);

    render(<LoginScreen />);

    // B. EJECUCIÓN: Llenamos el formulario con datos válidos para pasar la validación local
    const inputCorreo = screen.getByPlaceholderText(/correo electrónico/i);
    const inputPass = screen.getByPlaceholderText(/contraseña/i);
    const botonIngresar = screen.getByText('Iniciar sesión');

    fireEvent.changeText(inputCorreo, 'test@fail.com'); // Dato válido
    fireEvent.changeText(inputPass, '123456');             // Dato válido
    
    // Ahora sí presionamos el botón
    fireEvent.press(botonIngresar);

    // C. VERIFICACIÓN
    await waitFor(() => {
      // Verificamos que salió la alerta de error
      expect(Alert.alert).toHaveBeenCalledWith('⚠️ Error', 'No se pudo conectar con el servidor');
    });
  });
});