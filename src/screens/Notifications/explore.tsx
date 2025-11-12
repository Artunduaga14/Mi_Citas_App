import React, { useEffect, useState } from "react";
import { Dimensions, ImageBackground, SectionList, StyleSheet } from "react-native";
import ThemedText from "../../components/ui/ThemedText";
import ThemedView from "../../components/ui/ThemedView";
import HeaderGreeting from "../../components/cards/HeaderGreeting";
import { HttpService } from "../../services/GenericServices";
import AppointmentCard, { Appointment } from "../../components/cards/AppointmentCard";
import AppointmentDetailModal from "../../components/cards/AppointmentDetailModel";
import { RelatedPersonList } from "../../components/cards/RelatedPersonCard";
import { authService } from "../../services/Auth/AuthService";

// === CONFIGURACIÓN DE DIMENSIONES ===
const { width } = Dimensions.get("window")
const NUM_COLS = 3
const H_PADDING = 16
const GAP = 12
const CARD_SIZE = Math.floor((width - H_PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS)
type Tile = { kind: "person"; data: RelatedPersonList } | { kind: "add" };
export default function TabTwoScreen() {
  const [sections, setSections] = useState<{ title: string; data: Appointment[] }[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => { loadAppointments(); }, []);

  const loadAppointments = async () => {
    try {
       const userId = await authService.getUserId();
      const res = await HttpService.get(`/Citation/list/${userId}`);

      const items: Appointment[] = Array.isArray(res) ? res : [];

      const grouped: Record<string, Appointment[]> = {};
      items.forEach((it) => {
        const dateStr = new Intl.DateTimeFormat("es-ES", {
          day: "2-digit", month: "long", year: "numeric",
        }).format(new Date(it.appointmentDate));
        (grouped[dateStr] ||= []).push(it);
      });

      setSections(Object.keys(grouped).map((date) => ({ title: date, data: grouped[date] })));
    } catch (err) {
      console.error("Error cargando citas:", err);
      setSections([]);
    }
  };

  const onPressDetails = (item: Appointment) => {
    setSelected(item);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setTimeout(() => setSelected(null), 0);
  };

  return (
    <ImageBackground
      source={require("../../../assets/fonts/fontPrincipal.jpg")} // ajusta si tu imagen está en otra ruta
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ThemedView style={[styles.container, { backgroundColor: "transparent" }]}>
        <HeaderGreeting name="Mauricio Noscue" />

        <ThemedText type="title" style={styles.title}>Actividad</ThemedText>

        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <AppointmentCard item={item} onPressDetails={onPressDetails} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <ThemedText type="subtitle" style={styles.sectionHeader}>{title}</ThemedText>
          )}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          style={{ backgroundColor: "transparent" }}
        />

        {detailVisible && selected && (
          <AppointmentDetailModal
            visible={detailVisible}
            item={selected}
            onClose={closeDetail}
          />
        )}
      </ThemedView>
    </ImageBackground>
  );
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
 
  title: { marginLeft: 120, marginVertical: 10 },
  sectionHeader: { marginLeft: 16, marginTop: 20, marginBottom: 8 },
});
