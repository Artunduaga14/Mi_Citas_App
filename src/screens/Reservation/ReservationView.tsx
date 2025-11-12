import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { coreCitationService } from '../../services/socket/coreCitation.service';
import { Horario, socketService } from '../../services/socket/socket.service';
import { authService } from '../../services/Auth/AuthService';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export const ReservationView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { typeCitationId } = route.params as { typeCitationId: number };
  const [blocks, setBlocks] = useState<Horario[]>([]);
  const [selectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const scheduleHourId = 1;
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
        const list = await coreCitationService.getAvailableBlocks(typeCitationId, selectedDate, true);
        setBlocks(list);
        socketService.setBlocks(list);

        await socketService.connect(storedToken);
        await socketService.joinDay(scheduleHourId, selectedDate);

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
      {/* Header mejorado */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Agenda de citas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {blocks.map((h, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, !h.estaDisponible && styles.cardDisabled]}
            onPress={() => onPress(h)}
            disabled={!h.estaDisponible}
          >
            <View style={styles.cardContent}>
              <View style={styles.timeContainer}>
                <MaterialIcons name="schedule" size={20} color="#4FA8DE" />
                <Text style={styles.time}>{formatHora(h.hora)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoContainer}>
                <View style={styles.doctorRow}>
                  <MaterialIcons name="person" size={18} color="#4FA8DE" />
                  <Text style={styles.doctor}>Dr. Ortis Acosta Jhoyner Duvan</Text>
                </View>
                <View style={styles.specialtyRow}>
                  <MaterialIcons name="local-hospital" size={16} color="#999" />
                  <Text style={styles.specialty}>Consulta Externa</Text>
                </View>
              </View>
            </View>
            {h.estaDisponible && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Disponible</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const formatHora = (hora: string) => {
  const [hh, mm] = hora.split(':');
  const h = parseInt(hh, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mm} ${ampm}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#4FA8DE',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
  },
  cardDisabled: {
    backgroundColor: '#F5F7FA',
    borderColor: '#B0BEC5',
    shadowOpacity: 0.05,
  },
  cardContent: {
    padding: 18,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  time: {
    color: '#4FA8DE',
    fontWeight: '700',
    fontSize: 20,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  infoContainer: {
    gap: 8,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctor: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  specialty: {
    color: '#666',
    fontSize: 13,
    marginLeft: 6,
  },
  availableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4FA8DE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});