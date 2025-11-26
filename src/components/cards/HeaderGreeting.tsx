import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import ThemedText from "../ui/ThemedText";
import ThemedView from "../ui/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../../services/Auth/AuthService";
import { Subscription } from "rxjs";
import { notificationStore } from "../ui/notificationStore";
import { PersonService } from "../../services/hospital/personServices";
import { PersonList } from "../../models/Gestion/personModels";
import { HttpService } from "../../services/GenericServices";
import { NotificationItem } from "../../models/NotificationItem";

type Props = {
  name?: string;
};

export default function HeaderGreeting({ name }: Props) {
  const navigation = useNavigation<any>();
  const [person, setPerson] = useState<PersonList | null>(null);
  const [unread, setUnread] = useState(0);
  
  // 👉 Efecto 1: Suscripción al contador de notificaciones
  useEffect(() => {
    console.log("🎯 HeaderGreeting - Suscribiéndose a notificationStore");
    
    const sub: Subscription = notificationStore.unreadCount$.subscribe((count) => {
      console.log("🔔 HeaderGreeting - Badge actualizado a:", count);
      setUnread(count);
    });

    return () => {
      console.log("🎯 HeaderGreeting - Desuscribiéndose");
      sub.unsubscribe();
    };
  }, []);

  // 👉 Efecto 2: Cargar info de la persona
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

  // 👉 Efecto 3: NUEVO - Cargar notificaciones al iniciar
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await HttpService.GetAllUsers("Notification");
        const all: NotificationItem[] = response.data || [];
        
        // Filtrar: no eliminadas y no leídas (statustypesId !== 6)
        const unread = all.filter((n) => !n.isDeleted && n.statustypesId !== 6);
        
        console.log("📬 Notificaciones no leídas cargadas:", unread.length);
        
        // Actualizar el store para que el badge se sincronice
        notificationStore.setNotifications(unread);
      } catch (error) {
        console.error("Error cargando notificaciones:", error);
      }
    };

    loadNotifications();
  }, []); // Solo al montar el componente

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

  return (
    <ThemedView style={styles.container}>
      
      {/* 🔵 Avatar con iniciales */}
      <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>{initials}</ThemedText>
        </View>
      </TouchableOpacity>

      {/* Texto central */}
      <View style={styles.textContainer}>
        <ThemedText>Hola,</ThemedText>
        <ThemedText type="subtitle">{displayName}</ThemedText>
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