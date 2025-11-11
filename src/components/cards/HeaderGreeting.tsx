import { StyleSheet, View, TouchableOpacity } from "react-native";
import ThemedText from "../ui/ThemedText";
import ThemedView from "../ui/ThemedView";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import React from "react";
import { useNavigation } from "@react-navigation/native";

type Props = {
  name: string; // Nombre del usuario
};

export default function HeaderGreeting({ name }: Props) {
  // 👇 Usa any para que TS no moleste con "never"
  const navigation = useNavigation<any>();

  return (
    <ThemedView style={styles.container}>
      {/* 👤 Icono de usuario presionable */}
      <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
        <MaterialIcons name="account-circle" size={40} color="gray" />
      </TouchableOpacity>

      {/* 👋 Texto de saludo */}
      <View style={styles.textContainer}>
        <ThemedText>Hola,</ThemedText>
        <ThemedText type="subtitle">{name}</ThemedText>
      </View>

      {/* ☰ Icono de menú */}
      {/* <Entypo name="menu" size={28} color="black" style={styles.menuIcon} /> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    margin: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  menuIcon: {
    marginLeft: "auto",
  },
});
