import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import type { Appointment } from "../cards/AppointmentCard";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/MainStackNavigator";

type Props = { visible: boolean; item: Appointment; onClose: () => void };

export default function AppointmentDetailModal({ visible, item, onClose }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const dateObj = new Date(item.appointmentDate);

  const timeStr = item.timeBlock
    ? toHumanTime(item.timeBlock)
    : new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(dateObj);

  const dateStr = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj);

  const registeredStr = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(item.registrationDate));

  const isAttended =
    item.statustypesName?.toLowerCase() === "atendida" ||
    item.statustypesName?.toLowerCase() === "asistida";

  const goToDoctorReview = () => {
    onClose();
    navigation.navigate("DoctorReviewScreen", {
      doctorId: item.doctorId,
      citationId: item.id,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="calendar-month" size={26} color="#3D7BFF" />
            <Text style={styles.headerTitle}>Detalle de la cita</Text>

            {isAttended && (
              <TouchableOpacity style={{ marginRight: 10 }} onPress={goToDoctorReview}>
                <MaterialCommunityIcons name="star-circle" size={26} color="#FBBF24" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#111" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }}>
            <Row label="Estado" value={item.statustypesName} />

            <Row label="Fecha" value={dateStr} icon="calendar-outline" />

            <Row label="Hora" value={timeStr} icon="time-outline" />

            <Row label="Doctor" value={item.nameDoctor} icon="person-outline" />

            <Row
              label="Consultorio"
              value={item.consultingRoomName}
              icon="business-outline"
            />

            <Row
              label="N° Sala"
              value={String(item.roomNumber)}
              icon="home-outline"
            />

            {item.note ? (
              <Row
                label="Nota"
                value={item.note}
                icon="document-text-outline"
                multiline
              />
            ) : null}

            <Row label="Registrada" value={registeredStr} icon="time-outline" />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: "#111" }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Row({
  label,
  value,
  icon,
  multiline,
}: {
  label: string;
  value?: string | number | null;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.cellLabel}>
        {icon ? (
          <Ionicons
            name={icon}
            size={16}
            color="#6B7280"
            style={{ marginRight: 6 }}
          />
        ) : null}
        <Text style={styles.labelText}>{label}</Text>
      </View>

      <View style={styles.cellValue}>
        <Text
          style={styles.valueText}
          numberOfLines={multiline ? undefined : 1}
        >
          {value ?? "—"}
        </Text>
      </View>
    </View>
  );
}

function toHumanTime(hhmmss: string) {
  const [h, m] = hhmmss.split(":").map((t) => parseInt(t, 10));
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  cellLabel: { minWidth: 120, flexDirection: "row", alignItems: "center" },
  cellValue: { flex: 1 },
  labelText: { color: "#6B7280", fontWeight: "700" },
  valueText: { color: "#111827", fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  btnSecondary: { backgroundColor: "#F3F4F6" },
  btnText: { color: "#fff", fontWeight: "800" },
});
