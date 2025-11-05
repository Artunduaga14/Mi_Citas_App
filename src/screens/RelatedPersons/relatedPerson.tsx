// src/screens/RelatedPerson/relatedPerson.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemedText from "../../components/ui/ThemedText";
import ThemedView from "../../components/ui/ThemedView";
import HeaderGreeting from "../../components/cards/HeaderGreeting";

import { HttpService } from "../../services/GenericServices";
// ⚠️ Ideal: usa el tipo desde models/Gestion/RelatedPerson
// import { RelatedPersonList } from "../../models/Gestion/RelatedPerson";
import { RelatedPersonList } from "../../components/cards/RelatedPersonCard";

import RelatedPersonModal from "../../components/Forms/relatedPerson";

const { width } = Dimensions.get("window");
const NUM_COLS = 2;
const H_PADDING = 16;
const GAP = 16;
const CARD_SIZE = Math.floor((width - H_PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS);

type Tile = { kind: "person"; data: RelatedPersonList } | { kind: "add" };

export default function RelatedPersonsScreen() {
  const [people, setPeople] = useState<RelatedPersonList[]>([]);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // NUEVO: item en edición (si hay, el modal va en modo "edit")
  const [editItem, setEditItem] = useState<RelatedPersonList | null>(null);
  const isEdit = !!editItem;

  // TODO: id real del paciente
  const personId = 2;

  useEffect(() => {
    loadRelatedPersons();
  }, []);

  const loadRelatedPersons = async () => {
    try {
      const res = await HttpService.get(`RelatedPerson/by-person/${personId}`);
      const items: RelatedPersonList[] = Array.isArray(res) ? res : [];
      setPeople(items);
    } catch (err) {
      console.error("Error cargando personas relacionadas:", err);
      setPeople([]);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => {
      const name = (p.fullName || "").toLowerCase();
      const rel = (p.relation || "").toLowerCase();
      const doc = (p.document || "").toLowerCase();
      return name.includes(q) || rel.includes(q) || doc.includes(q);
    });
  }, [people, query]);

  const tiles: Tile[] = useMemo(() => {
    const t: Tile[] = filtered.map((p) => ({ kind: "person", data: p }));
    t.push({ kind: "add" });
    return t;
  }, [filtered]);

  // Tap en tarjeta (si quieres que edite al tocar, puedes llamar onPressEdit aquí)
  const onPressPerson = (p: RelatedPersonList) => {
    console.log("Tap card:", p.id);
  };

  const onPressAdd = () => {
    setEditItem(null); // modo crear
    setShowModal(true);
  };

  const onPressEdit = (p: RelatedPersonList) => {
    setEditItem(p);    // modo editar
    setShowModal(true);
  };

  const handleDelete = (item: RelatedPersonList) => {
    Alert.alert(
      "Eliminar",
      `¿Eliminar a "${item.fullName}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(item.id as number);
              await HttpService.delete(`RelatedPerson/${item.id}`);
              setPeople((prev) => prev.filter((p) => p.id !== item.id));
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "No se pudo eliminar.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Tile }) => {
    if (item.kind === "add") return <AddCard onPress={onPressAdd} />;
    return (
      <PersonTile
        item={item.data}
        onPress={() => onPressPerson(item.data)}
        onEdit={() => onPressEdit(item.data)}     // 👈 botón de editar
        onDelete={() => handleDelete(item.data)}  // 👈 botón de eliminar
        deleting={deletingId === item.data.id}
      />
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/fonts/fontPrincipal.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ThemedView style={[styles.container, { backgroundColor: "transparent" }]}>
        <HeaderGreeting name="Daniel Gómez" />

        <View style={styles.headerBlock}>
          <ThemedText type="title2" style={styles.title}>
            Personas Relacionadas
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Gestiona tus contactos y relaciones
          </ThemedText>
        </View>

        <FlatList
          data={tiles}
          numColumns={2}
          keyExtractor={(it, idx) => (it.kind === "add" ? "add" : `p-${it.data.id}`) + `-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={{ gap: 16 }}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>

      {/* MODAL crear/editar */}
      <RelatedPersonModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditItem(null);
        }}
        onSaved={async () => {
          await loadRelatedPersons();
        }}
        personId={personId}
        mode={isEdit ? "edit" : "create"}
        initial={editItem ?? undefined}
      />
    </ImageBackground>
  );
}

/* ---------- Tarjeta con Editar y Eliminar ---------- */
function PersonTile({
  item,
  onPress,
  onEdit,
  onDelete,
  deleting,
}: {
  item: RelatedPersonList;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  const initials = getInitials(item.fullName);
  const bg = (item as any).color || pickColor(item.fullName);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      {/* Botón Editar (lápiz) */}
      <TouchableOpacity
        onPress={onEdit}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        style={styles.editBtn}
      >
        <Ionicons name="create" size={18} color="#fff" />
      </TouchableOpacity>

      {/* Botón Eliminar (basura) */}
      <TouchableOpacity
        onPress={onDelete}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash" size={18} color="#fff" />
      </TouchableOpacity>

      <View style={styles.avatarWrap}>
        <View style={[styles.avatarCircle, { backgroundColor: bg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text numberOfLines={1} style={styles.nameText}>
          {item.fullName}
        </Text>
        <Text numberOfLines={1} style={styles.roleText}>
          {capitalize(item.relation || "Relacionado")}
        </Text>
      </View>

      {deleting ? (
        <View style={styles.deletingCover}>
          <Text style={styles.deletingText}>Eliminando…</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function AddCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, styles.addCard]}>
      <View style={styles.addDashed}>
        <Ionicons name="add" size={28} />
      </View>
      <Text style={styles.addText}>Agregar persona</Text>
    </TouchableOpacity>
  );
}

/* Utils */
function getInitials(name?: string) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}
function pickColor(seed?: string) {
  const palette = ["#5B8DEF", "#E74C3C", "#27AE60", "#8E44AD", "#F39C12", "#16A085"];
  let h = 0;
  (seed || "x").split("").forEach((c) => (h = (h * 31 + c.charCodeAt(0)) >>> 0));
  return palette[h % palette.length];
}
function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/* Styles */
const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "transparent" },

  headerBlock: { paddingHorizontal: 16, marginBottom: 8 },
  title: { marginBottom: 4 },
  subtitle: { color: "#6B7280" },

  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
    rowGap: 16,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    paddingVertical: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
     
    }),
  },

  /* Botones flotantes */
  editBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444",
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  deletingCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: CARD_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },
  deletingText: {
    color: "#fff",
    fontWeight: "700",
  },

  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#F3F6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },

  nameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    maxWidth: 130,
    textAlign: "center",
  },
  roleText: {
    marginTop: 2,
    fontSize: 12,
    color: "#005bf8ff",
    fontWeight: "600",
  },

  addCard: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  addDashed: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#959595ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  addText: {
    color: "#6B7280",
    fontWeight: "600",
  },
});
