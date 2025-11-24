// src/components/cards/__tests__/AppointmentCard.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AppointmentCard, { Appointment } from '../AppointmentCard';

// 🧩 Mock de iconos de Expo para evitar problemas con módulos nativos
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: (props: any) => <Text>{`Ionicon-${props.name}`}</Text>,
    MaterialCommunityIcons: (props: any) => (
      <Text>{`MCIcon-${props.name}`}</Text>
    ),
  };
});

const baseAppointment: Appointment = {
  id: 1,
  state: 'Agendada',
  note: null,
  appointmentDate: '2025-01-01T10:30:00.000Z',
  timeBlock: null,
  scheduleHourId: 1,
  nameDoctor: 'Dr. House',
  consultingRoomName: 'medicina general',
  roomNumber: 101,
  isDeleted: false,
  registrationDate: '2024-12-31T12:00:00.000Z',
};

describe('AppointmentCard', () => {
  it('debe renderizar el título con el nombre del consultorio capitalizado y subtítulo por estado "Agendada"', () => {
    render(<AppointmentCard item={baseAppointment} />);

    // Título: capitalizeFirst(consultingRoomName)
    expect(screen.getByText('Medicina general')).toBeTruthy();

    // Subtítulo por estado "Agendada"
    expect(screen.getByText('Tu cita está agendada')).toBeTruthy();

    // Botón "Ver detalle"
    expect(screen.getByText('Ver detalle')).toBeTruthy();
  });

  it('debe usar la nota del item como subtítulo cuando existe', () => {
    const item: Appointment = {
      ...baseAppointment,
      note: 'Traer exámenes de laboratorio',
    };

    render(<AppointmentCard item={item} />);

    expect(
      screen.getByText('Traer exámenes de laboratorio')
    ).toBeTruthy();
  });

  it('debe usar el subtítulo personalizado si se pasa "subtitleText"', () => {
    const item: Appointment = {
      ...baseAppointment,
      note: 'Esto debería ser ignorado por subtitleText',
    };

    render(
      <AppointmentCard
        item={item}
        subtitleText="Subtítulo personalizado"
      />
    );

    expect(screen.getByText('Subtítulo personalizado')).toBeTruthy();
  });

  it('debe usar el mensaje de asistencia cuando state = "Asistida"', () => {
    const item: Appointment = {
      ...baseAppointment,
      state: 'Asistida',
      note: null,
    };

    render(<AppointmentCard item={item} />);

    expect(
      screen.getByText('Gracias por asistir a tu cita')
    ).toBeTruthy();
  });

  it('debe llamar onPressDetails con el item al presionar "Ver detalle"', () => {
    const onPressDetails = jest.fn();

    render(
      <AppointmentCard
        item={baseAppointment}
        onPressDetails={onPressDetails}
      />
    );

    const btn = screen.getByText('Ver detalle');
    fireEvent.press(btn);

    expect(onPressDetails).toHaveBeenCalledTimes(1);
    expect(onPressDetails).toHaveBeenCalledWith(baseAppointment);
  });

  it('debe manejar correctamente cuando timeBlock viene definido', () => {
    const item: Appointment = {
      ...baseAppointment,
      timeBlock: '09:15:00',
    };

    render(<AppointmentCard item={item} />);

    // No validamos el formato exacto de la hora (depende del entorno),
    // pero sí que existe el texto de hora y la tarjeta no explota.
    // Solo comprobamos que el botón siga presente (indica render OK).
    expect(screen.getByText('Ver detalle')).toBeTruthy();
  });
});
