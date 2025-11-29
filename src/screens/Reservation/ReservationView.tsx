import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Text, Modal } from 'react-native';
import { coreCitationService } from '../../services/socket/coreCitation.service';
import { Horario, socketService } from '../../services/socket/socket.service';
import { authService } from '../../services/Auth/AuthService';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { HttpService } from '../../services/GenericServices';
import { DateNavigator } from '../../components/animations/DateNavigator';
import { WeekDatePicker } from '../../components/animations/WeekDatePicker';

export const ReservationView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { typeCitationId } = route.params as { typeCitationId: number };
  const [blocks, setBlocks] = useState<Horario[]>([]);
 const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );



  const [token, setToken] = useState<string | null>(null);
const [scheduleHourId, setScheduleHourId] = useState<number | null>(null);

  // 🔥 Estados para el modal moderno
  const [showModal, setShowModal] = useState(false);
  const [relatedPersons, setRelatedPersons] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null); // null = "Para mí"
  const [currentSlot, setCurrentSlot] = useState<Horario | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);

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
     const list = await coreCitationService.getAvailableBlocks(typeCitationId, selectedDate, false);

     console.log('Available blocks:', list);
      setBlocks(list);
      socketService.setBlocks(list);

          // 🟦 Asignar el ScheduleHourId real
          if (list.length > 0 && list[0].scheduleHourId) {
            setScheduleHourId(list[0].scheduleHourId);
          }

          // 🟦 Conectar
          await socketService.connect(storedToken);

          // 🟦 NO llamar joinDay hasta que tengamos un ID real
          if (list.length > 0 && list[0].scheduleHourId) {
            await socketService.joinDay(list[0].scheduleHourId, selectedDate);
          }


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

    setLoading(true);
    setScheduleHourId(h.scheduleHourId);

    const lock = await socketService.lock(h.hora);
    setLoading(false);

    if (!lock?.locked) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Horario ocupado',
        textBody: 'Este horario ya fue tomado por otro usuario.',
        button: 'Cerrar'
      });
      return;
    }

    setCurrentSlot(h);

    try {
      setLoading(true);
      const userId = await authService.getPersonId();
      const related = await HttpService.get(`/RelatedPerson/by-person/${userId}`);
      const list = Array.isArray(related) ? related : [];
      setLoading(false);

      // 🔥 Si NO hay personas relacionadas → Mostrar alerta de confirmación
      if (list.length === 0) {
        setShowConfirmAlert(true);
        return;
      }

      // 🔥 Si SÍ hay personas → Mostrar modal
      setRelatedPersons(list);
      setSelectedPerson(null); // Por defecto "Para mí"
      setShowModal(true);

    } catch (err) {
      console.error(err);
      setLoading(false);
      await socketService.unlock(h.hora);
    }
  };

  const confirmSlot = async (h: Horario, relatedPersonId?: number) => {
    try {
      setLoading(true);
      const result = await socketService.confirm(h.hora, relatedPersonId);
      setLoading(false);

      if (result.success) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "¡Éxito!",
          textBody: "Tu cita fue registrada correctamente."
        });
        setShowModal(false);
        setShowConfirmAlert(false);
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: result.reason || "No se pudo agendar.",
          button: "OK"
        });
        setLoading(true);
        await socketService.unlock(h.hora);
        setLoading(false);
        setShowModal(false);
        setShowConfirmAlert(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(true);
      await socketService.unlock(h.hora);
      setLoading(false);
      setShowModal(false);
      setShowConfirmAlert(false);
    }
  };

  const handleConfirm = async () => {
    if (!currentSlot) return;
    await confirmSlot(currentSlot, selectedPerson === null ? undefined : selectedPerson);
  };

  const handleCancel = async () => {
    if (currentSlot) {
      setLoading(true);
      await socketService.unlock(currentSlot.hora);
      setLoading(false);
    }
    setShowModal(false);
    setCurrentSlot(null);
    setSelectedPerson(null);
  };

  const handleCancelConfirmAlert = async () => {
    if (currentSlot) {
      setLoading(true);
      await socketService.unlock(currentSlot.hora);
      setLoading(false);
    }
    setShowConfirmAlert(false);
    setCurrentSlot(null);
  };

  const handleConfirmForMe = async () => {
    if (!currentSlot) return;
    await confirmSlot(currentSlot, undefined);
  };

  const reloadBlocks = async (newDate: string) => {
  try {
    setLoading(true);

    const list = await coreCitationService.getAvailableBlocks(
      typeCitationId,
      newDate,
      false
    );

    setBlocks(list);
    socketService.setBlocks(list);

    if (list.length > 0 && list[0].scheduleHourId) {
  setScheduleHourId(list[0].scheduleHourId);
  await socketService.joinDay(list[0].scheduleHourId, newDate);
}


    setLoading(false);
  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Agenda de citas</Text>
      </View>
<WeekDatePicker
  initialDate={selectedDate}
  onDateChange={(newDate) => {
    setSelectedDate(newDate);
    reloadBlocks(newDate);
  }}
/>



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

      {/* 🔥🔥🔥 MODAL MODERNO */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>¿Para quién es la cita?</Text>
              <Text style={styles.modalSubtitle}>Selecciona una opción</Text>
            </View>

            {/* Lista de opciones */}
            <ScrollView style={styles.modalScroll}>
              {/* Opción: Para mí */}
              <TouchableOpacity
                style={[
                  styles.personCard,
                  selectedPerson === null && styles.personCardSelected
                ]}
                onPress={() => setSelectedPerson(null)}
              >
                <View style={styles.personIcon}>
                  <MaterialIcons 
                    name="person" 
                    size={28} 
                    color={selectedPerson === null ? "#4FA8DE" : "#999"} 
                  />
                </View>
                <View style={styles.personInfo}>
                  <Text style={[
                    styles.personName,
                    selectedPerson === null && styles.personNameSelected
                  ]}>
                    Para mí
                  </Text>
                  <Text style={styles.personLabel}>Agendar para mi persona</Text>
                </View>
                {selectedPerson === null && (
                  <MaterialIcons name="check-circle" size={24} color="#4FA8DE" />
                )}
              </TouchableOpacity>

              {/* Personas relacionadas */}
              {relatedPersons.map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={[
                    styles.personCard,
                    selectedPerson === person.id && styles.personCardSelected
                  ]}
                  onPress={() => setSelectedPerson(person.id)}
                >
                  <View style={styles.personIcon}>
                    <MaterialIcons 
                      name="people" 
                      size={28} 
                      color={selectedPerson === person.id ? "#4FA8DE" : "#999"} 
                    />
                  </View>
                  <View style={styles.personInfo}>
                    <Text style={[
                      styles.personName,
                      selectedPerson === person.id && styles.personNameSelected
                    ]}>
                      {person.fullName}
                    </Text>
                    <Text style={styles.personLabel}>Persona relacionada</Text>
                  </View>
                  {selectedPerson === person.id && (
                    <MaterialIcons name="check-circle" size={24} color="#4FA8DE" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Botones de acción */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmar cita</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 👇 LOADING DENTRO DEL MODAL */}
          <LoadingOverlay visible={loading} />
        </View>
      </Modal>

      {/* 🔥🔥🔥 ALERTA DE CONFIRMACIÓN (cuando NO hay personas relacionadas) */}
      <Modal
        visible={showConfirmAlert}
        transparent
        animationType="fade"
        onRequestClose={handleCancelConfirmAlert}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertContainer}>
            <View style={styles.alertIconContainer}>
              <MaterialIcons name="event-available" size={50} color="#4FA8DE" />
            </View>
            
            <Text style={styles.alertTitle}>¿Confirmar cita?</Text>
            <Text style={styles.alertMessage}>
              Estás a punto de agendar esta cita para ti.
              {currentSlot && (
                <Text style={styles.alertTime}>{'\n\n'}Horario: {formatHora(currentSlot.hora)}</Text>
              )}
            </Text>

            <View style={styles.alertActions}>
              <TouchableOpacity 
                style={styles.alertCancelButton} 
                onPress={handleCancelConfirmAlert}
              >
                <Text style={styles.alertCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.alertConfirmButton} 
                onPress={handleConfirmForMe}
              >
                <Text style={styles.alertConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 👇 LOADING DENTRO DEL MODAL */}
          <LoadingOverlay visible={loading} />
        </View>
      </Modal>
    </View>
  );
};

// 🔥🔥🔥 COMPONENTE DE LOADING
const LoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContainer}>
        <MaterialIcons name="hourglass-empty" size={40} color="#4FA8DE" />
        <Text style={styles.loadingText}>Procesando...</Text>
      </View>
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

  // 🔥 ESTILOS DEL MODAL MODERNO
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
     zIndex: 9998,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalScroll: {
    maxHeight: 350,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F8F9FA',
  },
  personCardSelected: {
    backgroundColor: '#EFF8FC',
    borderColor: '#4FA8DE',
  },
  personIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  personNameSelected: {
    color: '#4FA8DE',
  },
  personLabel: {
    fontSize: 13,
    color: '#999',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4FA8DE',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 🔥 ESTILOS DE LA ALERTA DE CONFIRMACIÓN
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '85%',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  alertIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF8FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  alertTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4FA8DE',
  },
  alertActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  alertCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  alertCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  alertConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4FA8DE',
    alignItems: 'center',
  },
  alertConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 🔥 ESTILOS DEL LOADING OVERLAY
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});