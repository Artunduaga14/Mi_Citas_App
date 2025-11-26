import React, { useState, useEffect } from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { notificationSocket } from "../../services/socket/notification.socket";
import { 
  NotificationItem, 
  formatNotificationDate,
  getNotificationTypeInfo 
} from "../../models/NotificationItem";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { HttpService } from "../../services/GenericServices";

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();

  // NO LEÍDAS = statustypesId = 2
  const [unreadList, setUnreadList] = useState<NotificationItem[]>([]);

  // LEÍDAS = statustypesId = 4
  const [readList, setReadList] = useState<NotificationItem[]>([]);

  // Selección múltiple
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    // Listener de socket → siempre entrega NO LEÍDAS (2)
    const sub = notificationSocket.notifications$.subscribe((socketItems) => {
      // Solo agregar si hay notificaciones nuevas
      if (socketItems && socketItems.length > 0) {
        console.log("🔔 Nuevas notificaciones del socket:", socketItems.length);
        setUnreadList((prev) => [...socketItems, ...prev]);
      }
    });

    loadAllNotifications();

    return () => sub.unsubscribe();
  }, []);

  // 🚀 Cargar todas las notificaciones del usuario
  const loadAllNotifications = async () => {
    try {
      const response = await HttpService.GetAllUsers("Notification");
      const all: NotificationItem[] = response.data || [];
      
      console.log("✅ Total notificaciones recibidas:", all.length);
      
      // Debug: ver todos los statustypesId que vienen
      const statuses = all.map(n => n.statustypesId);
      console.log("🔍 Valores de statustypesId encontrados:", [...new Set(statuses)]);

      // Filtrar notificaciones no eliminadas
      const active = all.filter((n) => !n.isDeleted);
      console.log("✅ Notificaciones activas:", active.length);

      // Separar por estado:
      // - NO LEÍDAS: statustypesId = 2, 5 (o cualquier cosa que NO sea 6)
      // - LEÍDAS: statustypesId = 6
      const unread = active.filter((n) => n.statustypesId !== 6);
      const read = active.filter((n) => n.statustypesId === 6);

      console.log("📬 No leídas:", unread.length);
      console.log("📭 Leídas:", read.length);

      setUnreadList(unread);
      setReadList(read);
    } catch (error) {
      console.error("❌ Error al cargar notificaciones:", error);
    }
  };

  // ✔️ Marcar una notificación como LEÍDA (4)
  const markAsRead = async (item: NotificationItem) => {
    try {
      await HttpService.MarkAsRead(item.id);
      
      setUnreadList((prev) => prev.filter((x) => x.id !== item.id));
      setReadList((prev) => [{ ...item, statustypesId: 4 }, ...prev]);
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  // ✔️ Seleccionar/deseleccionar para eliminar
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✔️ Eliminar seleccionadas
  const deleteSelected = async () => {
    try {
      // await HttpService.DeleteNotifications(selectedIds);
      Alert.alert("Funcionalidad en desarrollo");
    } catch {}

    setUnreadList((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setReadList((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  // 🎯 Manejar redirección si existe
  const handleNotificationPress = (item: NotificationItem, isUnread: boolean) => {
    console.log("👆 Notificación presionada:", item.id, "- isUnread:", isUnread);
    
    if (isUnread) {
      markAsRead(item);
    }

    // Si tiene URL de redirección, navegar
    if (item.redirectUrl) {
      console.log("🔗 Redirigiendo a:", item.redirectUrl);
      // Aquí puedes agregar lógica de navegación según la URL
      // navigation.navigate(item.redirectUrl);
    }

    // Si tiene citationId, ir a la cita
    if (item.citationId) {
      console.log("📅 Ir a cita:", item.citationId);
      // navigation.navigate("CitationDetail", { id: item.citationId });
    }
  };

  const renderNotification = (item: NotificationItem, isUnread: boolean) => {
    const isSelected = selectedIds.includes(item.id);
    const typeInfo = getNotificationTypeInfo(item.typeNotification);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item, isUnread)}
        onLongPress={() => toggleSelect(item.id)}
      >
        <View
          style={[
            styles.card,
            isUnread && styles.cardUnread,
            isSelected && styles.cardSelected,
          ]}
        >
          {/* Indicador de no leída */}
          {isUnread && <View style={styles.unreadDot} />}

          {/* Icono según tipo de notificación */}
          <View style={[
            styles.iconContainer, 
            { backgroundColor: typeInfo.bgColor }
          ]}>
            <MaterialIcons 
              name={typeInfo.icon as any} 
              size={24} 
              color={typeInfo.color} 
            />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.statustypesName && (
                <View style={[styles.badge, { backgroundColor: typeInfo.bgColor }]}>
                  <Text style={[styles.badgeText, { color: typeInfo.color }]}>
                    {item.statustypesName}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.cardMsg} numberOfLines={2}>
              {item.message}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.cardDate}>
                {formatNotificationDate(item.registrationDate)}
              </Text>

              {/* Indicadores adicionales */}
              {item.citationId && (
                <View style={styles.indicator}>
                  <MaterialIcons name="event" size={14} color="#6B7280" />
                  <Text style={styles.indicatorText}>Cita</Text>
                </View>
              )}

              {item.redirectUrl && (
                <View style={styles.indicator}>
                  <MaterialIcons name="arrow-forward" size={14} color="#6B7280" />
                </View>
              )}
            </View>
          </View>

          {/* Checkmark de selección */}
          {isSelected && (
            <View style={styles.checkmark}>
              <MaterialIcons name="check-circle" size={24} color="#FF6B6B" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            {unreadList.length > 0 && (
              <Text style={styles.headerSubtitle}>
                {unreadList.length} nuevas
              </Text>
            )}
          </View>
        </View>

        {selectedIds.length > 0 && (
          <TouchableOpacity style={styles.deleteButton} onPress={deleteSelected}>
            <MaterialIcons name="delete" size={22} color="white" />
            <Text style={styles.deleteText}>{selectedIds.length}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[
          { type: "section", title: "Nuevas", key: "unread-section" },
          ...unreadList.map((item) => ({ type: "unread", item, key: `unread-${item.id}` })),
          { type: "section", title: "Anteriores", key: "read-section" },
          ...readList.map((item) => ({ type: "read", item, key: `read-${item.id}` })),
        ]}
        keyExtractor={(item: any) => item.key}
        renderItem={({ item }: any) => {
          if (item.type === "section") {
            const count = item.title === "Nuevas" ? unreadList.length : readList.length;
            
            if (count === 0 && item.title === "Nuevas") {
              return (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{item.title}</Text>
                    <View style={styles.sectionLine} />
                  </View>
                  <View style={styles.emptyContainer}>
                    <MaterialIcons name="check-circle-outline" size={48} color="#BDC3C7" />
                    <Text style={styles.emptyText}>No tienes notificaciones nuevas</Text>
                  </View>
                </>
              );
            }

            if (count === 0 && item.title === "Anteriores") {
              return (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{item.title}</Text>
                    <View style={styles.sectionLine} />
                  </View>
                  <View style={styles.emptyContainer}>
                    <MaterialIcons name="inbox" size={48} color="#BDC3C7" />
                    <Text style={styles.emptyText}>No hay notificaciones anteriores</Text>
                  </View>
                </>
              );
            }

            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {item.title} ({count})
                </Text>
                <View style={styles.sectionLine} />
              </View>
            );
          }

          if (item.type === "unread" && unreadList.length > 0) {
            return renderNotification(item.item, true);
          }

          if (item.type === "read" && readList.length > 0) {
            return renderNotification(item.item, false);
          }

          return null;
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F3F5",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
    marginTop: 2,
  },

  deleteButton: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  deleteText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  listContent: {
    paddingBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#495057",
    letterSpacing: 0.5,
  },

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DEE2E6",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  emptyText: {
    textAlign: "center",
    color: "#ADB5BD",
    fontSize: 15,
    marginTop: 12,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
  },

  cardUnread: {
    backgroundColor: "#F0F7FF",
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },

  cardSelected: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },

  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  cardContent: {
    flex: 1,
    gap: 6,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    flex: 1,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  cardMsg: {
    fontSize: 14,
    color: "#6C757D",
    lineHeight: 20,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  cardDate: {
    fontSize: 12,
    color: "#ADB5BD",
    fontWeight: "500",
  },

  indicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F3F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  indicatorText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },

  checkmark: {
    position: "absolute",
    top: 16,
    right: 16,
  },
});