import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import ThemedText from "../ui/ThemedText";
import ThemedView from "../ui/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../../services/Auth/AuthService";
import { PersonService } from "../../services/hospital/personServices";
import { PersonList } from "../../models/Gestion/personModels";

type Props = {
  name?: string;
};

export default function HeaderGreeting({ name }: Props) {
  const navigation = useNavigation<any>();
  const [person, setPerson] = useState<PersonList | null>(null);

  useEffect(() => {
    const loadPerson = async () => {
      try {
        const userId = await authService.getUserId();
        if (!userId) return;

        const info = await PersonService.getById(userId);
        setPerson(info);
      } catch (error) {
        console.error("Error cargando persona:", error);
      }
    };

    loadPerson();
  }, []);

  // Nombre visible en "Hola, Karen Artunduaga"
  const displayName = person
    ? `${person.fullName} ${person.fullLastName}`
    : name || "Usuario";

  // 🔤 Iniciales del avatar
  const initials = person
    ? `${(person.fullName?.[0] || "").toUpperCase()}${(
        person.fullLastName?.[0] || ""
      ).toUpperCase()}`
    : "U";

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
                routes: [{ name: "LoginScreen" }],
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
      
      {/* 🔵 Avatar con iniciales */}
      <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>{initials}</ThemedText>
        </View>
      </TouchableOpacity>

      {/* 👋 Texto de saludo */}
      <View style={styles.textContainer}>
        <ThemedText>Hola,</ThemedText>
        <ThemedText type="subtitle">{displayName}</ThemedText>
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

  // ⬇️ Avatar con iniciales (igual al de la pantalla de perfil)
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: "#cdd9fbff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  avatarText: {
    color: "#2F80ED",
    fontSize: 18,
    fontWeight: "700",
  },
});
