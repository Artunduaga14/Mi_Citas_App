// src/components/cards/__tests__/AppointmentDetailModal.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock de iconos de Expo (evita módulos nativos)
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: (props: any) => <Text>{`Ion-${props.name}`}</Text>,
    MaterialCommunityIcons: (props: any) => <Text>{`MCI-${props.name}`}</Text>,
  };
});

// Importamos el componente
import AppointmentDetailModal from '../AppointmentDetailModel';
import type { Appointment } from '../AppointmentCard';

const mockItem: Appointment = {
  id: 1,
  state: 'Agendada',
  note: 'Traer documento original',
  appointmentDate: '2025-01-01T10:30:00.000Z',
  timeBlock: null,
  scheduleHourId: 1,
  nameDoctor: 'Dr. House',
  consultingRoomName: 'Medicina General',
  roomNumber: 101,
  isDeleted: false,
  registrationDate: '2024-12-31T09:15:00.000Z',
};

describe('AppointmentDetailModal', () => {
  it('debe renderizar el modal con los datos principales', () => {
    render(
      <AppointmentDetailModal visible={true} item={mockItem} onClose={() => {}} />
    );

    expect(screen.getByText('Detalle de la cita')).toBeTruthy();
    expect(screen.getByText('Agendada')).toBeTruthy();
    expect(screen.getByText('Medicina General')).toBeTruthy();
    expect(screen.getByText('101')).toBeTruthy();
    expect(screen.getByText('Dr. House')).toBeTruthy();
    expect(screen.getByText('Traer documento original')).toBeTruthy();
  });

  it('debe llamar onClose al presionar el botón "Cerrar"', () => {
    const onClose = jest.fn();

    render(
      <AppointmentDetailModal visible={true} item={mockItem} onClose={onClose} />
    );

    const closeBtn = screen.getByText('Cerrar');
    fireEvent.press(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
