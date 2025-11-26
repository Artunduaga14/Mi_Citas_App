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
  statustypesName: string; // "Programada", "Cancelada", "No Asistida", "Atendida", "Reprogramada"
  note: string | null;
  appointmentDate: string;
  timeBlock?: string | null;
  scheduleHourId: number;
  nameDoctor: string;
  consultingRoomName: string;
  roomNumber: number;
  isDeleted: boolean;
  registrationDate: string;
  doctorId: number;
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

  // Función para obtener el subtítulo según el estado
  const getSubtitleByStatus = (status: string) => {
    switch (status) {
      case "Programada":
        return "Tu cita está programada";
      case "Atendida":
        return "Gracias por asistir a tu cita";
      case "Cancelada":
        return "Cita cancelada";
      case "No Asistida":
        return "No asististe a esta cita";
      case "Reprogramada":
        return "Cita reprogramada";
      default:
        return status;
    }
  };

  const subtitle = subtitleText ?? item.note ?? getSubtitleByStatus(item.statustypesName);

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Programada":
        return "#3D7BFF"; // Azul
      case "Atendida":
        return "#34C759"; // Verde
      case "Cancelada":
        return "#FF3B30"; // Rojo
      case "No Asistida":
        return "#FF9500"; // Naranja
      case "Reprogramada":
        return "#AF52DE"; // Púrpura
      default:
        return "#FFA62B"; // Naranja por defecto
    }
  };

  const statusColor = getStatusColor(item.statustypesName);
  console.log("Rendering AppointmentCard with statusColor:", item.statustypesName);
  // Función para obtener el icono del estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Programada":
        return "calendar-clock";
      case "Atendida":
        return "check-circle";
      case "Cancelada":
        return "close-circle";
      case "No Asistida":
        return "alert-circle";
      case "Reprogramada":
        return "calendar-refresh";
      default:
        return "information";
    }
  };

  return (
    <View style={[styles.card, { borderBottomColor: statusColor }]}>
      {/* Cabecera */}
      <View style={styles.headerRow}>
        <View style={[styles.leftIconBubble, { backgroundColor: `${statusColor}20` }]}>
          <MaterialCommunityIcons 
            name="stethoscope" 
            size={24} 
            color={statusColor} 
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {capitalizeFirst(item.consultingRoomName || "Consulta externa")}
          </Text>
          <Text style={styles.roomNumber}>Consultorio #{item.roomNumber}</Text>
        </View>
        <MaterialCommunityIcons
          name="calendar-check"
          size={26}
          color={statusColor}
          style={styles.headerRightIcon}
        />
      </View>

      {/* Doctor */}
      <View style={styles.doctorRow}>
        <MaterialCommunityIcons name="doctor" size={16} color="#666" />
        <Text style={styles.doctorText} numberOfLines={1}>
          {item.nameDoctor}
        </Text>
      </View>

      {/* Subtítulo/Nota si existe */}
      {!!subtitle && (
        <View style={styles.subtitleRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.subtitle, { color: statusColor }]} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      )}

      {/* Fila con hora y fecha */}
      <View style={styles.dateTimeRow}>
        <View style={styles.infoPill}>
          <Ionicons name="time-outline" size={16} color="#555" />
          <Text style={styles.infoText}>{timeStr}</Text>
        </View>

        <View style={styles.infoPill}>
          <Ionicons name="calendar-outline" size={16} color="#555" />
          <Text style={styles.infoText}>{dateStr}</Text>
        </View>
      </View>

      {/* Fila con estado y botón Ver detalle */}
      <View style={styles.bottomRow}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <MaterialCommunityIcons 
            name={getStatusIcon(item.statustypesName)} 
            size={16} 
            color={statusColor} 
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.statustypesName}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.detailBtn, { backgroundColor: statusColor }]}
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
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { 
        elevation: 5 
      },
    }),
    borderBottomWidth: 3,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  leftIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },

  roomNumber: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },

  headerRightIcon: {
    marginLeft: 8,
  },

  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingLeft: 4,
  },

  doctorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginLeft: 6,
    flex: 1,
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingLeft: 4,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },

  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
    gap: 8,
  },

  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },

  infoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    flex: 1,
  },

  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },

  detailBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexShrink: 0,
  },

  detailBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});