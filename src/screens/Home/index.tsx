import React, { useEffect, useState } from "react"
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
} from "react-native"

import BannerCard from "../../components/cards/BannerCard"
import HeaderGreeting from "../../components/cards/HeaderGreeting"
import ThemedText from "../../components/ui/ThemedText"
import ThemedView from "../../components/ui/ThemedView"
import { HttpService } from "../../services/GenericServices"

// === CONFIGURACIÓN DE DIMENSIONES ===
const { width } = Dimensions.get("window")
const NUM_COLS = 3
const H_PADDING = 16
const GAP = 12
const CARD_SIZE = Math.floor((width - H_PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS)

// === ICONOS (asegúrate de que existan estos archivos) ===
const ICONS: Record<string, any> = {
  consulta: require("../../../assets/icons/IconsTypeCitation/CExterna.png"),
  odontologia: require("../../../assets/icons/IconsTypeCitation/odontologia.png"),
  pediatria: require("../../../assets/icons/IconsTypeCitation/pediatria.png"),
  citologia: require("../../../assets/icons/IconsTypeCitation/citologia.png"),
  vacuna: require("../../../assets/icons/IconsTypeCitation/vacuna.png"),
  psicologia: require("../../../assets/icons/IconsTypeCitation/psicologia.png"),
  cexterna: require("../../../assets/icons/IconsTypeCitation/psicologia.png"),
  laboratorio: require("../../../assets/icons/IconsTypeCitation/vacuna.png"),
}

// === DATOS DE RESPALDO ===
const DATA = [
  { id: "1", name: "Consulta General", icon: "consulta" },
  { id: "2", name: "Odontología", icon: "odontologia" },
  { id: "3", name: "Pediatría", icon: "pediatria" },
  { id: "4", name: "Citología", icon: "citologia" },
  { id: "5", name: "Vacunación", icon: "vacuna" },
  { id: "6", name: "Psicología", icon: "psicologia" },
  { id: "7", name: "Consulta Externa", icon: "cexterna" },
  { id: "8", name: "Laboratorio Clínico", icon: "laboratorio" },
]


// === NORMALIZADOR DE TEXTO ===
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()

export default function HomeScreen() {
  const [citations, setCitations] = useState<any[]>([])

  useEffect(() => { getTypeDocument() }, [])

  const getTypeDocument = async () => {
    try {
      const response = await HttpService.get("TypeCitation")
      if (Array.isArray(response) && response.length > 0) setCitations(response)
      else setCitations(DATA)
    } catch {
      setCitations(DATA)
    }
  }

  const dataToRender = citations.length ? citations : DATA

  const getImageSource = (item: any) => {
    if (!item) return null
    const candidateRaw = (item.icon ?? item.iconName ?? item.image ?? item.name ?? item.label ?? item.type ?? "") + ""
    if (!candidateRaw) return null
    if (typeof candidateRaw !== "string") return candidateRaw
    const s = candidateRaw.trim()
    if (!s) return null
    if (s.startsWith("http")) return { uri: s }
    const normalized = normalize(s)
    if (ICONS[normalized]) return ICONS[normalized]
    const firstWord = normalized.split(" ")[0]
    if (ICONS[firstWord]) return ICONS[firstWord]
    for (let k of Object.keys(ICONS)) {
      const nk = normalize(k)
      if (normalized.includes(nk) || nk.includes(normalized)) return ICONS[k]
    }
    if (ICONS[s]) return ICONS[s]
    return null
  }

  return (
    <ImageBackground
      // ⚠️ Usa una imagen de fondo real (no un logo blanco). Cambia la ruta si usas otra:
      source={require("../../../assets/fonts/fontPrincipal.jpg")}//---------------------------------------------------------------------------------------------------
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        {/* 👇 Transparente para que se vea el fondo */}
        <ThemedView style={[styles.container, { backgroundColor: "transparent" }]}>
          <HeaderGreeting name="Daniel Gómez " />

          <BannerCard
            image={require("../../../assets/images/Imagen1.png")}
            title=""
            subtitle=""
          />

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Tipos de Citas
          </ThemedText>

          <FlatList
            data={dataToRender}
            keyExtractor={(item) => item?.id?.toString() ?? item.name}
            numColumns={NUM_COLS}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.grid}
            renderItem={({ item, index }) => {
              const img = getImageSource(item)
              // const bg = BG_COLORS[index % BG_COLORS.length]
              return (
                <View style={styles.cardWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    // style={[styles.iconBox, { backgroundColor: bg }]}
                    onPress={() => console.log("Seleccionado:", item)}
                  >
                    <Image
                      source={img ?? require("../../../assets/icons/logo.png")}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  <Text style={styles.cardLabel} numberOfLines={2}>
                    {item.name ?? item.label ?? "Sin nombre"}
                  </Text>
                </View>
              )
            }}
          />

          <ThemedText type="subtitle" style={styles.sectionTitleSeparated}>
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
  )
}

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
  cardImage: { width: CARD_SIZE * 0.5, height: CARD_SIZE * 0.5 },
  cardLabel: { marginTop: 6, fontSize: 12, textAlign: "center", color: "#333" },
  sectionTitleSeparated: { marginTop: 24, marginBottom: 8, marginLeft: 8, fontSize: 18, fontWeight: "700" },
})
