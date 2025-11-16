// src/screens/Perfil/PersonPerfil.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

import {
  PersonService,
  CatalogService,
  DocumentTypeDto,
  EpsDto,
} from "../../services/hospital/personServices";
import { PersonList } from "../../models/Gestion/personModels";
import { authService } from "../../services/Auth/AuthService";

import PerfilForm, {
  PersonUpdate,
} from "../../components/Forms/personProfileForm";

export default function PersonProfile() {
  const navigation = useNavigation<any>();

  const [person, setPerson] = useState<PersonList | null>(null);
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // 👉 catálogos
  const [docTypes, setDocTypes] = useState<DocumentTypeDto[]>([]);
  const [epsList, setEpsList] = useState<EpsDto[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadPerson(), loadCatalogs()]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadPerson = async () => {
    try {
      const personId = await authService.getUserId(); // debe coincidir con el que usa tu API
      if (!personId) return;
      const data = await PersonService.getById(Number(personId));
      setPerson(data);
    } catch (err) {
      console.error("Error cargando persona:", err);
      Alert.alert("Error", "No se pudo cargar la información de la persona");
    }
  };

  const loadCatalogs = async () => {
    try {
      const [docs, eps] = await Promise.all([
        CatalogService.getDocumentTypes(),
        CatalogService.getEps(),
      ]);
      setDocTypes(docs);
      setEpsList(eps);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    }
  };

  const toYmd = (dateStr?: string) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  const handleSave = async (data: PersonUpdate) => {
    try {
      setSaving(true);

      await PersonService.update({
        ...data,
        dateBorn: data.dateBorn?.split("T")[0] ?? data.dateBorn,
      });

      setEditOpen(false);
      await loadPerson();
      Alert.alert("✅ Listo", "Información actualizada correctamente");
    } catch (e) {
      console.error("Error al actualizar persona:", e);
      Alert.alert("⚠️ Error", "No se pudo actualizar la información");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout(); // limpia token / storage
    } finally {
      // 👇 usamos el navegador padre (root) si existe
      const rootNav = navigation.getParent() ?? navigation;

      rootNav.reset({
        index: 0,
        routes: [{ name: "Auth" as never }], // 👈 nombre del stack de autenticación
      });
    }
  };

  if (loading || !person) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const initials = `${(person.fullName?.[0] || "").toUpperCase()}${(
    person.fullLastName?.[0] || ""
  ).toUpperCase()}`;

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        {/* Header con degradado */}
        <LinearGradient
          colors={["#2f5feeff", "#1677e6ff", "#3183e0ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          {/* Botón atrás */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Menú de tres puntos */}
          <View style={styles.menuWrapper}>
            <TouchableOpacity onPress={() => setMenuOpen((v) => !v)}>
              <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
            </TouchableOpacity>

            {menuOpen && (
              <View style={styles.menuBox}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                >
                  <Ionicons name="create" size={16} color="#1677e6" />
                  <Text style={styles.menuText}>Editar información</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <Ionicons name="log-out" size={16} color="#d11a2a" />
                  <Text style={[styles.menuText, { color: "#d11a2a" }]}>
                    Salir
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Avatar + nombre */}
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.headerName}>{person.fullName}</Text>
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
            value={`${person.documentTypeAcronymName ?? ""} ${
              person.document
            }`}
          />
        </View>

        {/* CONTACTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACTO</Text>
          <InfoRow icon="call" label="Teléfono" value={person.phoneNumber} />
          {/* Cuando tengas email del backend, reemplaza aquí */}
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

      {/* ===== Bottom sheet de edición (formulario) ===== */}
      {editOpen && person && (
        <View style={styles.editOverlay}>
          <PerfilForm
            initial={{
              id: person.id,
              fullName: person.fullName ?? "",
              fullLastName: person.fullLastName ?? "",
              documentTypeId: person.documentTypeId ?? 0,
              document: person.document ?? "",
              dateBorn: toYmd(person.dateBorn),
              phoneNumber: person.phoneNumber ?? "",
              epsId: person.epsId ?? 0,
              gender: person.gender ?? "",
              healthRegime: person.healthRegime ?? "",
            }}
            docTypes={docTypes}
            epsList={epsList}
            onSubmit={handleSave}
            onCancel={() => setEditOpen(false)}
            saving={saving}
          />
        </View>
      )}
    </>
  );
}

/* COMPONENTE REUTILIZABLE */
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
      <Ionicons
        name={icon}
        size={18}
        color="#007bff"
        style={{ marginRight: 8 }}
      />
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

function capitalize(s?: string) {
  return s
    ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    : "";
}

/* STYLES */
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    height: 210,
    paddingTop: 55,
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

  menuWrapper: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 30,
  },
  menuBox: {
    position: "absolute",
    top: -4, // un poco por encima del icono
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    minWidth: 180,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e7eb",
    marginVertical: 2,
  },

  headerContent: {
    alignItems: "center",
    marginTop: 18,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    position: "relative",
  },
  avatarText: { fontSize: 26, fontWeight: "bold", color: "#2F80ED" },
  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00C853",
    position: "absolute",
    bottom: 4,
    right: 4,
    borderWidth: 2,
    borderColor: "#EAF0FF",
  },
  headerName: { fontSize: 18, fontWeight: "700", color: "#fff" },

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
  infoLabel: { fontSize: 12, color: "#777", marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#222" },
  highlightValue: {
    color: "#2F80ED",
    backgroundColor: "#EAF2FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },

  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
});
