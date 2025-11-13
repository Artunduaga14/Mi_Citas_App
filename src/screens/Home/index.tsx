import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";

import BannerCard from "../../components/cards/BannerCard";
import HeaderGreeting from "../../components/cards/HeaderGreeting";
import ThemedText from "../../components/ui/ThemedText";
import ThemedView from "../../components/ui/ThemedView";
import { HttpService } from "../../services/GenericServices";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const NUM_COLS = 3;
const H_PADDING = 16;
const GAP = 12;
const CARD_SIZE = Math.floor(
  (width - H_PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS
);

const ICONS: Record<string, any> = {
  consulta: require("../../../assets/icons/IconsTypeCitation/CExterna.png"),
  odontologia: require("../../../assets/icons/IconsTypeCitation/odontologia.png"),
  pediatria: require("../../../assets/icons/IconsTypeCitation/pediatria.png"),
  citologia: require("../../../assets/icons/IconsTypeCitation/citologia.png"),
  vacuna: require("../../../assets/icons/IconsTypeCitation/vacuna.png"),
  psicologia: require("../../../assets/icons/IconsTypeCitation/psicologia.png"),
  cexterna: require("../../../assets/icons/IconsTypeCitation/psicologia.png"),
  laboratorio: require("../../../assets/icons/IconsTypeCitation/vacuna.png"),
};

const DATA = [
  { id: "1", name: "Consulta General", icon: "consulta" },
  { id: "2", name: "Odontología", icon: "odontologia" },
  { id: "3", name: "Pediatría", icon: "pediatria" },
  { id: "4", name: "Citología", icon: "citologia" },
  { id: "5", name: "Vacunación", icon: "vacuna" },
  { id: "6", name: "Psicología", icon: "psicologia" },
  { id: "7", name: "Consulta Externa", icon: "cexterna" },
  { id: "8", name: "Laboratorio Clínico", icon: "laboratorio" },
];

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();


  type RootStackParamList = {
  Home: undefined;
  ReservationView: { typeCitationId: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;


export default function HomeScreen() {
   const navigation = useNavigation<NavigationProp>();
  const [citations, setCitations] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false); // control del modal

  useEffect(() => {
    getTypeDocument();
  }, []);

  const getTypeDocument = async () => {
    try {
      const response = await HttpService.get("TypeCitation");
      if (Array.isArray(response) && response.length > 0) setCitations(response);
      else setCitations(DATA);
    } catch {
      setCitations(DATA);
    }
  };

  const dataToRender = citations.length ? citations : DATA;

  const getImageSource = (item: any) => {
    if (!item) return null;
    const candidateRaw =
      (item.icon ??
        item.iconName ??
        item.image ??
        item.name ??
        item.label ??
        item.type ??
        "") + "";
    if (!candidateRaw) return null;
    if (typeof candidateRaw !== "string") return candidateRaw;
    const s = candidateRaw.trim();
    if (!s) return null;
    if (s.startsWith("http")) return { uri: s };
    const normalized = normalize(s);
    if (ICONS[normalized]) return ICONS[normalized];
    const firstWord = normalized.split(" ")[0];
    if (ICONS[firstWord]) return ICONS[firstWord];
    for (let k of Object.keys(ICONS)) {
      const nk = normalize(k);
      if (normalized.includes(nk) || nk.includes(normalized)) return ICONS[k];
    }
    if (ICONS[s]) return ICONS[s];
    return null;
  };

  // 👉 Máximo 5 tipos visibles; si hay más, aparece el botón "Ver más"
  const MAX_VISIBLE = 5;
  const visibleCitations = dataToRender.slice(0, MAX_VISIBLE);
  const shouldShowMore = dataToRender.length > MAX_VISIBLE;

  // Si hay más tipos de cita, agregamos el botón; si no, solo mostramos lo que hay
  const gridData = shouldShowMore
    ? [...visibleCitations, { id: "more", name: "Ver más", isAddButton: true }]
    : visibleCitations;

  return (
    <ImageBackground
      source={require("../../../assets/fonts/fontPrincipal.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
      >
        <ThemedView
          style={[styles.container, { backgroundColor: "transparent" }]}
        >
          <HeaderGreeting name="Mauricio Noscue " />

          <BannerCard
            image={require("../../../assets/images/Imagen1.png")}
            title=""
            subtitle=""
          />

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Tipos de Citas
          </ThemedText>

          {/* === Cuadrícula con hasta 5 ítems + botón “ver más” === */}
          <FlatList
            data={gridData}
            keyExtractor={(item) => item.id.toString()}
            numColumns={NUM_COLS}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => {
              if ((item as any).isAddButton) {
                return (
                  <View style={styles.cardWrapper}>
                    <TouchableOpacity
                      style={styles.addCard}
                      onPress={() => setShowAll(true)}
                    >
                      <Text style={styles.addIcon}>＋</Text>
                    </TouchableOpacity>
                    <Text style={styles.cardLabel}>Ver más</Text>
                  </View>
                );
              }

              const img = getImageSource(item);
              return (
                <View style={styles.cardWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.iconBox}
                     onPress={() =>
                      navigation.navigate("ReservationView", { typeCitationId: Number(item.id) })
                    }
                  >
                    <Image
                      source={
                        img ?? require("../../../assets/icons/logo.png")
                      }
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  <Text style={styles.cardLabel} numberOfLines={2}>
                    {item.name ?? item.label ?? "Sin nombre"}
                  </Text>
                </View>
              );
            }}
          />

          {/* === Modal con todas las citas (bottom sheet redondeado) === */}
          <Modal visible={showAll} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHandle} />

                <ThemedText type="subtitle" style={styles.modalTitle}>
                  Todos los tipos de citas
                </ThemedText>

                <FlatList
                  data={dataToRender}
                  numColumns={3}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.grid}
                  columnWrapperStyle={styles.columnWrapper}
                  renderItem={({ item }) => {
                    const img = getImageSource(item);
                    return (
                      <View style={styles.cardWrapper}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.iconBox}
                          onPress={() => console.log("Seleccionado:", item)}
                        >
                          <Image
                            source={
                              img ?? require("../../../assets/icons/logo.png")
                            }
                            style={styles.cardImage}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        <Text style={styles.cardLabel}>{item.name}</Text>
                      </View>
                    );
                  }}
                />

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowAll(false)}
                >
                  <Text style={styles.closeText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <ThemedText
            type="subtitle"
            style={styles.sectionTitleSeparated}
          >
            Mis personas
          </ThemedText>

          <BannerCard
            image={require("../../../assets/images/loginimages/font.png")}
            subtitle="SEGUNDA JORNADA NACIONAL DE VACUNACIÓN Y"
            title="SEMANA DE VACUNACIÓN DE LAS AMÉRICAS"
          />
        </ThemedView>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  content: { paddingBottom: 24 },
  container: { flex: 1, padding: 16, backgroundColor: "transparent" },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "700",
  },
  grid: { paddingHorizontal: 4 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 12 },
  cardWrapper: { width: CARD_SIZE, alignItems: "center", marginBottom: 4 },
  iconBox: {
    width: CARD_SIZE - 60,
    height: CARD_SIZE - 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },
  cardImage: { width: CARD_SIZE * 0.5, height: CARD_SIZE * 0.5 },
  cardLabel: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },

  // botón “+”
  addCard: {
    width: CARD_SIZE - 55,
    height: CARD_SIZE - 55,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.64)",
    marginBottom: 3,
  },
  addIcon: { fontSize: 28, color: "#555" },

  // modal bottom sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#f5f6fa",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginBottom: 10,
  },
  modalTitle: {
    marginVertical: 12,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    backgroundColor: "#2F80ED",
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "center",
    width: 140,
  },
  closeText: { color: "#fff", textAlign: "center", fontWeight: "600" },

  sectionTitleSeparated: {
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "700",
  },
});
