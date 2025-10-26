import React, { useEffect, useState } from "react";
import { ImageBackground, SectionList, StyleSheet, View } from "react-native";
import  ThemedText  from "../../components/ui/ThemedText";
import  ThemedView  from "../../components/ui/ThemedView";
import HeaderGreeting from "../../components/cards/HeaderGreeting";
import { HttpService } from "../../services/GenericServices";
import AppointmentCard, { Appointment } from "../../components/cards/AppointmentCard";

export default function TabTwoScreen() {
  const [sections, setSections] = useState<
    { title: string; data: Appointment[] }[]
  >([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      // 👇 Aquí deberías pegar tu endpoint real
      const res = await HttpService.get("Citation/list");
      const items: Appointment[] = Array.isArray(res) ? res : [];

      // Mock agrupado por fecha (usa appointmentDate → dd/mm/yyyy)
      const grouped: Record<string, Appointment[]> = {};
      items.forEach((it) => {
        const dateStr = new Intl.DateTimeFormat("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(it.appointmentDate));
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(it);
      });

      const arr = Object.keys(grouped).map((date) => ({
        title: date,
        data: grouped[date],
      }));
      setSections(arr);
    } catch (err) {
      console.error("Error cargando citas:", err);
      setSections([]);
    }
  };

  const onPressDetails = (item: Appointment) => {
    console.log("Detalle cita:", item.id);
  };

  return (
     <ImageBackground
          // ⚠️ Usa una imagen de fondo real (no un logo blanco). Cambia la ruta si usas otra:
          source={require("../../../assets/fonts/fontPrincipal.jpg")}//---------------------------------------------------------------------------------------------------
          style={{ flex: 1 }}
          resizeMode="cover"
        >
    <ThemedView style={styles.container}>
      {/* Encabezado */}
      <HeaderGreeting name="Daniel Gómez" />

      {/* Título */}
      <ThemedText type="title" style={styles.title}>
        Actividad
      </ThemedText>

      {/* Lista agrupada */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <AppointmentCard item={item} onPressDetails={onPressDetails} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <ThemedText type="subtitle" style={styles.sectionHeader}>
            {title}
          </ThemedText>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </ThemedView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  title: {
    marginLeft: 16,
    marginVertical: 10,
  },
  sectionHeader: {
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 8,
  },
});
