import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import ThemedText from "../ui/ThemedText";
import ThemedView from "../ui/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../../services/Auth/AuthService";

type Props = {
  name: string; // Nombre del usuario
};

export default function HeaderGreeting({ name }: Props) {
  const navigation = useNavigation<any>();

  // 🔹 Maneja el cierre de sesión
  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await authService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: "LoginScreen" }], // 👈 redirige a Login
              });
            } catch (error) {
              console.error("Error cerrando sesión:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* 👤 Icono de perfil */}
      <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
        <MaterialIcons name="account-circle" size={40} color="gray" />
      </TouchableOpacity>

      {/* 👋 Texto de saludo */}
      <View style={styles.textContainer}>
        <ThemedText>Hola,</ThemedText>
        <ThemedText type="subtitle">{name}</ThemedText>
      </View>

      {/* 🚪 Botón de logout */}
      <TouchableOpacity onPress={handleLogout}>
        <MaterialIcons name="logout" size={28} color="gray" />
      </TouchableOpacity>
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
});
