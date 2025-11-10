import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { PersonService } from "../../services/hospital/personServices";
import { PersonList } from "../../models/Gestion/personModels";

export default function PersonProfile() {
  const navigation = useNavigation<any>();   // 👈 AQUÍ se usa el hook

  const [person, setPerson] = useState<PersonList | null>(null);
  const [loading, setLoading] = useState(true);

  const personId = 2; // por ahora fijo en persona 2

  useEffect(() => {
    loadPerson();
  }, []);

  const loadPerson = async () => {
    try {
      const data = await PersonService.getById(personId);
      setPerson(data);
    } catch (err) {
      console.error("Error cargando persona:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !person) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const initials = `${(person.fullName[0] || "").toUpperCase()}${(
    person.fullLastName[0] || ""
  ).toUpperCase()}`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      {/* Encabezado con degradado */}
      <LinearGradient
        colors={["#2f5feeff", "#1677e6ff", "#3183e0ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backBtn}
          // 🔹 opción 1: volver a la pantalla anterior
           onPress={() => navigation.goBack()}
          // 🔸 opción 2: ir a una pantalla específica
          //onPress={() => navigation.navigate("RelatedPersons")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.headerName}>{person.fullName}</Text>
          <View style={styles.onlineDot} />
        </View>
      </LinearGradient>

      {/* INFORMACIÓN PERSONAL */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>
        <InfoRow
          icon="person"
          label="Nombre completo"
          value={`${person.fullName} ${person.fullLastName}`}
        />
        <InfoRow
          icon="calendar"
          label="Fecha de nacimiento"
          value={formatDate(person.dateBorn)}
        />
        <InfoRow
          icon="male-female"
          label="Género"
          value={capitalize(person.gender)}
          highlight
        />
        <InfoRow
          icon="id-card"
          label="Documento"
          value={`${person.documentTypeAcronymName ?? ""} ${person.document}`}
        />
      </View>

      {/* CONTACTO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONTACTO</Text>
        <InfoRow icon="call" label="Teléfono" value={person.phoneNumber} />
        <InfoRow icon="mail" label="Email" value="daniel.gomez@email.com" />
      </View>

      {/* INFORMACIÓN DE SALUD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMACIÓN DE SALUD</Text>
        <InfoRow
          icon="medkit"
          label="EPS"
          value={person.epsName ?? "Sin EPS"}
        />
        <InfoRow
          icon="medal"
          label="Régimen de salud"
          value={capitalize(person.healthRegime)}
        />
      </View>
    </ScrollView>
  );
}

/* COMPONENTE DE FILA */
function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#007bff" style={{ marginRight: 8 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, highlight && styles.highlightValue]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* HELPERS */
function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

/* STYLES */
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    height: 200,
    paddingTop: 50,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    padding: 8,
  },
  menuBtn: {
    position: "absolute",
    top: 50,
    right: 16,
    padding: 8,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2F80ED",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00C853",
    position: "absolute",
    bottom: 40,
    left: 80,
  },

  section: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#000",
    fontSize: 14,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  highlightValue: {
    color: "#2F80ED",
    backgroundColor: "#EAF2FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
});
