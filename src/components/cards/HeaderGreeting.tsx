import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import ThemedText from "../ui/ThemedText";
import ThemedView from "../ui/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../../services/Auth/AuthService";
import { Subscription } from "rxjs";
import { notificationStore } from "../ui/notificationStore";

type Props = {
  name: string; // Nombre del usuario
};

export default function HeaderGreeting({ name }: Props) {
  const navigation = useNavigation<any>();
  const [unread, setUnread] = useState(0);

  
  useEffect(() => {
    const sub: Subscription = notificationStore.unreadCount$.subscribe((count) =>
      setUnread(count)
    );
    return () => sub.unsubscribe();
  }, []);

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
      routes: [{ name: "Protected" }],
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
      {/* Perfil */}
      <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
        <MaterialIcons name="account-circle" size={40} color="gray" />
      </TouchableOpacity>

      {/* Texto central */}
      <View style={styles.textContainer}>
        <ThemedText>Hola,</ThemedText>
        <ThemedText type="subtitle">{name}</ThemedText>
      </View>

      {/* 🔔 Notificaciones */}
      <TouchableOpacity
        style={styles.notificationContainer}
        onPress={() => navigation.navigate("NotificationsScreen")}
      >
        <MaterialIcons name="notifications" size={30} color="gray" />

        {unread > 0 && (
          <View style={styles.badge}>
            <ThemedText type="default" style={styles.badgeText}>
              {unread}
            </ThemedText>

          </View>
        )}
      </TouchableOpacity>

      {/* Logout */}
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

  notificationContainer: {
    marginRight: 12,
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#e63946",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});