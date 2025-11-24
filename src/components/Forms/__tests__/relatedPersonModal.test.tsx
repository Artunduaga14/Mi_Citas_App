// src/components/Forms/__tests__/relatedPersonModal.test.tsx
import React from 'react';
import { Alert } from 'react-native';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import { Picker } from '@react-native-picker/picker';

import RelatedPersonModal, {
  RelatedPersonModalProps,
} from '../relatedPerson';
import { HttpService } from '../../../services/GenericServices';
import { RelatedPersonService } from '../../../services/hospital/relatedPerson';

// ====== Mocks de servicios ======
jest.mock('../../../services/GenericServices', () => ({
  HttpService: {
    get: jest.fn(),
  },
}));

jest.mock('../../../services/hospital/relatedPerson', () => ({
  RelatedPersonService: {
    create: jest.fn(),
    Update: jest.fn(),
  },
}));

// Evitar que Alert saque popups reales en los tests
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Helpers
const mockDocTypes = [
  { id: 1, name: 'Cédula de ciudadanía' },
  { id: 2, name: 'Tarjeta de identidad' },
];

describe('RelatedPersonModal', () => {
  const baseProps: RelatedPersonModalProps = {
    visible: true,
    onClose: jest.fn(),
    onSaved: jest.fn(),
    personId: 99,
    documentTypes: mockDocTypes,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar en modo creación y crear una persona relacionada cuando el formulario es válido', async () => {
    const onClose = jest.fn();
    const onSaved = jest.fn();

    const { UNSAFE_getAllByType } = render(
      <RelatedPersonModal
        {...baseProps}
        onClose={onClose}
        onSaved={onSaved}
        mode="create"
      />
    );

    // Título de creación
    expect(
      screen.getByText('Agregar persona relacionada')
    ).toBeTruthy();

    // Llenamos los campos de texto
    const [inputNombre, inputApellido] =
      screen.getAllByPlaceholderText('Solo letras');
    const inputDocumento = screen.getByPlaceholderText('Solo números');

    fireEvent.changeText(inputNombre, 'Juan');
    fireEvent.changeText(inputApellido, 'Pérez');
    fireEvent.changeText(inputDocumento, '12345678');

    // Pickers (Relación + Tipo de documento)
    const pickers = UNSAFE_getAllByType(Picker);

    // pickers[0] -> Relación (ya trae "Otro", podemos cambiarlo opcionalmente)
    fireEvent(pickers[0], 'valueChange', 'Papá');

    // pickers[1] -> Tipo de documento
    fireEvent(pickers[1], 'valueChange', 1); // Cédula

    // Botón Guardar
    const saveBtn = screen.getByText('Guardar');
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(RelatedPersonService.create).toHaveBeenCalledTimes(1);
    });

    expect(RelatedPersonService.create).toHaveBeenCalledWith({
      personId: 99,
      firstName: 'Juan',
      lastName: 'Pérez',
      relation: 'Papá',
      documentTypeId: 1,
      document: '12345678',
    });

    // onClose y onSaved deben ser llamados
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledTimes(1);

    // Al menos una alerta de éxito
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('debe precargar datos y actualizar en modo edición', async () => {
    const onClose = jest.fn();
    const onSaved = jest.fn();

    const initial = {
      id: 5,
      fullName: 'Carlos Gómez',
      relation: 'Hermano',
      document: '55555',
      documentTypeId: 2,
    } as any; // simulamos RelatedPersonList mínimo

    const { UNSAFE_getAllByType } = render(
      <RelatedPersonModal
        {...baseProps}
        onClose={onClose}
        onSaved={onSaved}
        mode="edit"
        initial={initial}
      />
    );

    // Título de edición
    expect(
      screen.getByText('Editar persona relacionada')
    ).toBeTruthy();

    // Debe mostrar "Guardar cambios" en vez de "Guardar"
    expect(screen.getByText('Guardar cambios')).toBeTruthy();

    // Se deben precargar los valores en los inputs
    // fullName = "Carlos Gómez" => nombre "Carlos", apellido "Gómez"
    expect(screen.getByDisplayValue('Carlos')).toBeTruthy();
    expect(screen.getByDisplayValue('Gómez')).toBeTruthy();
    expect(screen.getByDisplayValue('55555')).toBeTruthy();

    // Modificamos algún campo
    const [inputNombre] =
      screen.getAllByPlaceholderText('Solo letras');
    fireEvent.changeText(inputNombre, 'Carlitos');

    const pickers = UNSAFE_getAllByType(Picker);

    // Cambiamos relación, por ejemplo a "Hermana"
    fireEvent(pickers[0], 'valueChange', 'Hermana');

    // Tipo de documento -> 1
    fireEvent(pickers[1], 'valueChange', 1);

    // Guardamos
    const saveBtn = screen.getByText('Guardar cambios');
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(RelatedPersonService.Update).toHaveBeenCalledTimes(1);
    });

    expect(RelatedPersonService.Update).toHaveBeenCalledWith({
      personId: 99,
      firstName: 'Carlitos',
      lastName: 'Gómez',
      relation: 'Hermana',
      documentTypeId: 1,
      document: '55555',
      id: 5,
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it('debe cargar tipos de documento desde la API cuando no se pasan por props', async () => {
    (HttpService.get as jest.Mock).mockResolvedValue([
      { id: 10, name: 'Pasaporte' },
    ]);

    render(
      <RelatedPersonModal
        visible={true}
        onClose={jest.fn()}
        onSaved={jest.fn()}
        personId={1}
        // 👇 sin documentTypes
      />
    );

    await waitFor(() => {
      expect(HttpService.get).toHaveBeenCalledWith('DocumentType');
    });
  });

  it('no debe intentar guardar si el formulario es inválido', async () => {
    render(
      <RelatedPersonModal
        {...baseProps}
        mode="create"
      />
    );

    // Solo llenamos nombre para que sea inválido
    const [inputNombre] =
      screen.getAllByPlaceholderText('Solo letras');
    fireEvent.changeText(inputNombre, 'X'); // inválido (menos de 2 letras)

    const saveBtn = screen.getByText('Guardar');
    fireEvent.press(saveBtn);

    // No debería llamar al servicio
    expect(RelatedPersonService.create).not.toHaveBeenCalled();
  });
});
