import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "../../components/ui/ThemedText";
import ThemedView from "../../components/ui/ThemedView";
import HeaderGreeting from "../../components/cards/HeaderGreeting";
import { HttpService } from "../../services/GenericServices";
import { RelatedPersonList } from "../../components/cards/RelatedPersonCard"; // solo para el tipo
// === CONFIGURACIÓN DE DIMENSIONES ===
const { width } = Dimensions.get("window")
const NUM_COLS = 3
const H_PADDING = 16
const GAP = 12
const CARD_SIZE = Math.floor((width - H_PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS)
type Tile = { kind: "person"; data: RelatedPersonList } | { kind: "add" };

export default function RelatedPersonsScreen() {
  const [people, setPeople] = useState<RelatedPersonList[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadRelatedPersons();
  }, []);

  const loadRelatedPersons = async () => {
    try {
      const res = await HttpService.get("RelatedPerson");
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

  const onPressPerson = (p: RelatedPersonList) => {
    console.log("Detalle persona relacionada:", p.id);
    // TODO: navegar a detalle o abrir modal
  };

  const onPressAdd = () => {
    console.log("Agregar persona");
    // TODO: abrir modal/route de creación
  };

  const renderItem = ({ item }: { item: Tile }) => {
    if (item.kind === "add") return <AddCard onPress={onPressAdd} />;
    return <PersonTile item={item.data} onPress={() => onPressPerson(item.data)} />;
  };

  return (
    <ImageBackground
      source={require("../../../assets/fonts/fontPrincipal.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ThemedView style={[styles.container, { backgroundColor: "transparent" }]}>
        {/* Encabezado */}
        <HeaderGreeting name="Daniel Gómez" />

        {/* Título + subtítulo */}
        <View style={styles.headerBlock}>
          <ThemedText type="title2" style={styles.title}>
            Personas Relacionadas
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Gestiona tus contactos y relaciones
          </ThemedText>
        </View>

        {/* Buscador */}
        {/* <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#8A8A8A" style={{ marginHorizontal: 10 }} />
          <TextInput
            placeholder="Buscar"
            placeholderTextColor="#9AA0A6"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View> */}

        {/* Grid 2 columnas */}
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
    </ImageBackground>
  );
}

/* ---------- Tile de persona (avatar + nombre + relación) ---------- */
function PersonTile({ item, onPress }: { item: RelatedPersonList; onPress: () => void }) {
  const initials = getInitials(item.fullName);
  const bg = item.color || pickColor(item.fullName);
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
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
    </TouchableOpacity>
  );
}

/* ---------- Tile “Agregar persona” ---------- */
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

/* ---------- Utils ---------- */
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

/* ---------- Styles ---------- */
const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  content: { paddingBottom: 24 },
  container: { flex: 1, padding: 16, backgroundColor: "transparent" }, // 👈 clave
  sectionTitle: { marginTop: 12, marginBottom: 8, marginLeft: 8, fontSize: 18, fontWeight: "700" },
  grid: { paddingHorizontal: 4 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 12 },
  cardWrapper: { width: CARD_SIZE, alignItems: "center", marginBottom: 4 },
  iconBox: {
    width: CARD_SIZE - 10,
    height: CARD_SIZE - 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
 

  headerBlock: { paddingHorizontal: 16, marginBottom: 8 },
  title: { marginBottom: 4 },
  subtitle: { color: "#6B7280" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingRight: 14,
    color: "#111",
  },

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
