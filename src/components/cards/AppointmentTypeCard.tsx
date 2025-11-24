// AppointmentTypeCard.js - MANTÉN TUS COLORES
import React from "react";
import { StyleSheet, ImageBackground, View, TouchableOpacity } from "react-native";
import  ThemedText  from "../ui/ThemedText";

type Props = {
  image: any;
  label: string;
};

export default function AppointmentTypeCard({ image, label }: Props) {
  return (
    <TouchableOpacity style={styles.card} testID="appointment-type-card">
      <ImageBackground
        source={image}
        style={styles.image}
        imageStyle={{ borderRadius: 16 }}
        resizeMode="cover"
         testID="appointment-type-image" 
      />
      <ThemedText style={styles.label}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    margin: 8, // Espaciado entre cards
    borderWidth: 2,
    borderColor: "#4A90E2",
    borderRadius: 16,
    padding: 8,
  
    width: '28%', // Aproximadamente 22% para 4 columnas con margen
  },
  image: {
    width: 60, // Tamaño más grande
    height: 60,
    borderRadius: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});