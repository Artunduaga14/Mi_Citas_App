import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export type Appointment = {
  id: number;
  state: string;
  note: string | null;
  appointmentDate: string;
  timeBlock?: string | null;
  scheduleHourId: number;
  nameDoctor: string;
  consultingRoomName: string;
  roomNumber: number;
  isDeleted: boolean;
  registrationDate: string;
};

type Props = {
  item: Appointment;
  onPressDetails?: (item: Appointment) => void;
  subtitleText?: string;
};

export default function AppointmentCard({ item, onPressDetails, subtitleText }: Props) {
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

  const subtitle =
    subtitleText ??
    item.note ??
    (item.state === "Asistida"
      ? "Gracias por asistir a tu cita"
      : item.state === "Agendada"
      ? "Tu cita está agendada"
      : item.state);

  return (
    <View style={styles.card}>
      {/* Cabecera */}
      <View style={styles.headerRow}>
        <View style={styles.leftIconBubble}>
          <MaterialCommunityIcons name="account-outline" size={28} color="#4B7FD6" />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {capitalizeFirst(item.consultingRoomName || "Consulta externa")}
        </Text>
        <MaterialCommunityIcons
          name="calendar-month"
          size={28}
          color="#3D7BFF"
          style={styles.headerRightIcon}
        />
      </View>

      {/* Subtítulo */}
      {!!subtitle && (
        <View style={styles.subtitleRow}>
          <View style={styles.dot} />
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      )}

      {/* Fila con hora, fecha y botón */}
      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Ionicons name="time-outline" size={18} color="#000" />
          <Text style={styles.infoText}>{timeStr}</Text>
        </View>

        <View style={styles.infoPill}>
          <Ionicons name="calendar-outline" size={18} color="#000" />
          <Text style={styles.infoText}>{dateStr}</Text>
        </View>

        <View style={{ flex: 1 }} />
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.detailBtn}
          onPress={() => onPressDetails?.(item)}
        >
          <Text style={styles.detailBtnText}>Ver detalle</Text>
        </TouchableOpacity>
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

function capitalizeFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
    borderBottomWidth: 4,
    borderBottomColor: "#FFA62B",
  },

  leftIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  headerRightIcon: {
    marginLeft: 8,
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#FFA62B",
    marginRight: 8,
  },
  subtitle: {
    color: "#FFA62B",
    fontSize: 16,
    fontWeight: "600",
  },

  infoRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 8,
  justifyContent: "space-between", // 👈 clave: reparte espacio
},

  infoPill: {
  flexDirection: "row",
  alignItems: "center",
  marginRight: 10,
  backgroundColor: "#F2F4F7",
  borderRadius: 10,
  paddingVertical: 6,
  paddingHorizontal: 5,
  flexShrink: 1, // 👈 evita que empujen el botón
},
  infoText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

 detailBtn: {
  backgroundColor: "#6B8CFF",
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 16,
  flexShrink: 0, // 👈 nunca se achica
},
  detailBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  
});
