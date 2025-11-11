import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { coreCitationService } from '../../services/socket/coreCitation.service';
import { Horario, socketService } from '../../services/socket/socket.service';
import { authService } from '../../services/Auth/AuthService';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';

export const ReservationView = () => {
  const [blocks, setBlocks] = useState<Horario[]>([]);
  const [selectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const scheduleHourId = 1;
  const typeCitationId = 4; // 🔹 temporalmente fijo (ej: Consulta externa)
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const storedToken = await authService.getToken();

      if (!storedToken || !(await authService.isAuthenticated())) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Sesión inválida',
          textBody: 'Por favor inicia sesión nuevamente.',
          button: 'Entendido',
        });
        return;
      }

      setToken(storedToken);

      try {
        // 1️⃣ Obtener bloques vía REST
        const list = await coreCitationService.getAvailableBlocks(typeCitationId, selectedDate, true);
        setBlocks(list);
        socketService.setBlocks(list);

        // 2️⃣ Conectarse al Hub con token real
        await socketService.connect(storedToken);
        await socketService.joinDay(scheduleHourId, selectedDate);

        // 3️⃣ Escuchar cambios
        const sub = socketService.blocksChanges$.subscribe(setBlocks);

        return () => {
          sub.unsubscribe();
          socketService.leaveDay();
        };
      } catch (error) {
        console.error('Error inicializando cita:', error);
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Error',
          textBody: 'No se pudieron cargar los horarios disponibles.',
          button: 'OK',
        });
      }
    })();
  }, []);

  const onPress = async (h: Horario) => {
    if (!h.estaDisponible || !token) return;

    const lock = await socketService.lock(h.hora);
    if (!lock?.locked) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Horario ocupado',
        textBody: 'Este horario ya fue tomado por otro usuario.',
        button: 'Cerrar',
      });
      return;
    }

Dialog.show({
  type: ALERT_TYPE.INFO,
  title: 'Confirmar cita',
  textBody: `¿Quieres agendar la cita a las ${formatHora(h.hora)}?`,
  button: 'Sí, confirmar',
  autoClose: false,
  onPressButton: async () => {
    Dialog.hide();
    const result = await socketService.confirm(h.hora);

    if (result.success) {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: '¡Éxito!',
        textBody: 'Tu cita fue registrada correctamente.',
      });
    } else {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: result.reason || 'No se pudo agendar. Intenta nuevamente.',
        button: 'OK',
      });
    }
  },
});

// Mostramos aparte el botón “Cancelar” como Toast alternativo
Toast.show({
  type: ALERT_TYPE.WARNING,
  title: '¿Deseas cancelar?',
  textBody: 'Presiona aquí para cancelar la reserva.',
  autoClose: false,
  onPress: async () => {
    await socketService.unlock(h.hora);
    Toast.hide();
    Dialog.hide();
  },
});


  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Agenda de citas</Text>
      <ScrollView>
        {blocks.map((h, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, !h.estaDisponible && styles.cardDisabled]}
            onPress={() => onPress(h)}
          >
            <Text style={styles.time}>Hora: {formatHora(h.hora)}</Text>
            <Text style={styles.doctor}>Dr. Ortis Acosta Jhoyner Duvan</Text>
            <Text style={styles.specialty}>Consulta Externa</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerText}>Registrar</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🔹 Conversión a formato 12h
const formatHora = (hora: string) => {
  const [hh, mm] = hora.split(':');
  const h = parseInt(hh, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mm} ${ampm}`;
};

// 🔹 Estilos visuales
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F9',
    padding: 20,
  },
  header: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#4FA8DE',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardDisabled: {
    backgroundColor: '#A0AFC4',
  },
  time: { color: '#fff', fontWeight: '700' },
  doctor: { color: '#fff', marginTop: 4 },
  specialty: { color: '#eaf3ff', fontSize: 12 },
  registerButton: {
    marginTop: 15,
    backgroundColor: '#4FA8DE',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  registerText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
