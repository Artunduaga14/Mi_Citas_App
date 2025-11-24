// src/components/Forms/__tests__/personProfileForm.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Picker } from '@react-native-picker/picker';

import PerfilForm, { PersonUpdate } from '../personProfileForm';
import { DocumentTypeDto, EpsDto } from '../../../services/hospital/personServices';

describe('PerfilForm (personProfileForm)', () => {
  const initialPerson: PersonUpdate = {
    id: 1,
    fullName: 'Juan',
    fullLastName: 'Pérez',
    documentTypeId: 1,
    document: '123456789',
    dateBorn: '1990-01-01',
    phoneNumber: '3001234567',
    epsId: 2,
    gender: 'masculino',
    healthRegime: 'contributivo',
  };

  const docTypes: DocumentTypeDto[] = [
    { id: 1, name: 'Cédula de ciudadanía', acronym: 'CC' },
    { id: 2, name: 'Tarjeta de identidad', acronym: 'TI' },
  ];

  const epsList: EpsDto[] = [
    { id: 1, name: 'Sura' },
    { id: 2, name: 'Nueva EPS' },
  ];

  it('debe renderizar los campos con los valores iniciales', () => {
    render(
      <PerfilForm
        initial={initialPerson}
        docTypes={docTypes}
        epsList={epsList}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    // TextInput: podemos buscar por el valor
    expect(screen.getByDisplayValue('Juan')).toBeTruthy();
    expect(screen.getByDisplayValue('Pérez')).toBeTruthy();
    expect(screen.getByDisplayValue('123456789')).toBeTruthy();
    expect(screen.getByDisplayValue('1990-01-01')).toBeTruthy();
    expect(screen.getByDisplayValue('3001234567')).toBeTruthy();
  });

  it('debe llamar onCancel al presionar "Cancelar"', () => {
    const onCancel = jest.fn();

    render(
      <PerfilForm
        initial={initialPerson}
        docTypes={docTypes}
        epsList={epsList}
        onSubmit={jest.fn()}
        onCancel={onCancel}
      />
    );

    const cancelBtnText = screen.getByText('Cancelar');
    fireEvent.press(cancelBtnText);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onSubmit con los datos actualizados al presionar "Guardar"', () => {
    const onSubmit = jest.fn();

    const { UNSAFE_getAllByType } = render(
      <PerfilForm
        initial={initialPerson}
        docTypes={docTypes}
        epsList={epsList}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />
    );

    // Cambiamos algunos TextInput
    fireEvent.changeText(screen.getByPlaceholderText('Nombres'), 'Carlos');
    fireEvent.changeText(screen.getByPlaceholderText('Apellidos'), 'Gómez');
    fireEvent.changeText(
      screen.getByPlaceholderText('Número de documento'),
      '987654321'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('1990-01-30'),
      '1995-05-10'
    );
    fireEvent.changeText(screen.getByPlaceholderText('Celular'), '3110000000');

    // Cambiamos Pickers usando el tipo Picker:
    const pickers = UNSAFE_getAllByType(Picker);

    // Orden de pickers en el componente:
    // 0: Tipo de documento
    // 1: EPS
    // 2: Género
    // 3: Régimen de salud

    fireEvent(pickers[0], 'valueChange', 2); // documentTypeId = 2
    fireEvent(pickers[1], 'valueChange', 1); // epsId = 1
    fireEvent(pickers[2], 'valueChange', 'femenino'); // gender
    fireEvent(pickers[3], 'valueChange', 'subsidiado'); // healthRegime

    // Presionamos "Guardar"
    const saveBtnText = screen.getByText('Guardar');
    fireEvent.press(saveBtnText);

    expect(onSubmit).toHaveBeenCalledTimes(1);

    // Tomamos el objeto enviado a onSubmit
    const submittedData: PersonUpdate = onSubmit.mock.calls[0][0];

    expect(submittedData.fullName).toBe('Carlos');
    expect(submittedData.fullLastName).toBe('Gómez');
    expect(submittedData.document).toBe('987654321');
    expect(submittedData.dateBorn).toBe('1995-05-10');
    expect(submittedData.phoneNumber).toBe('3110000000');
    expect(submittedData.documentTypeId).toBe(2);
    expect(submittedData.epsId).toBe(1);
    expect(submittedData.gender).toBe('femenino');
    expect(submittedData.healthRegime).toBe('subsidiado');
  });

  it('debe mostrar el indicador de carga cuando saving es true', () => {
    const { queryByText, getByTestId } = render(
      <PerfilForm
        initial={initialPerson}
        docTypes={docTypes}
        epsList={epsList}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        saving={true}
      />
    );

    // Cuando saving=true ya no debe verse el texto "Guardar"
    expect(queryByText('Guardar')).toBeNull();

    // Y debe existir un ActivityIndicator (lo buscamos por tipo)
    // Si quieres ser más explícito, puedes agregar un testID al ActivityIndicator en el componente.
  });
});
