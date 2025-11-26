import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type StatusType = {
  id: number | string;
  name: string;
  color: string;
  icon: string;
};

const STATUS_TYPES: StatusType[] = [
  { id: "all", name: "Todas", color: "#6B7280", icon: "calendar-multiple" },
  { id: 1, name: "Programada", color: "#3D7BFF", icon: "calendar-clock" },
  { id: 4, name: "Atendida", color: "#34C759", icon: "check-circle" },
  { id: 2, name: "Cancelada", color: "#FF3B30", icon: "close-circle" },
  { id: 3, name: "No Asistida", color: "#FF9500", icon: "alert-circle" },
  { id: 10, name: "Reprogramada", color: "#AF52DE", icon: "calendar-refresh" },
];

type Props = {
  onFilterChange?: (filterId: number | string) => void;
};

export default function FilterButton({ onFilterChange }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<number | string>("all");

  const handleFilterSelect = (filterId: number | string) => {
    setSelectedFilter(filterId);
    onFilterChange?.(filterId);
    setModalVisible(false);
  };

  const activeStatus = STATUS_TYPES.find((s) => s.id === selectedFilter);

  return (
    <>
      {/* Botón de filtro */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.filterBtn, { backgroundColor: activeStatus?.color }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="filter" size={22} color="#FFF" />
        {selectedFilter !== "all" && <View style={styles.badge} />}
      </TouchableOpacity>

      {/* Modal de filtros */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar citas</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Opciones de filtro */}
            <View style={styles.optionsContainer}>
              {STATUS_TYPES.map((status) => {
                const isSelected = selectedFilter === status.id;
                return (
                  <TouchableOpacity
                    key={status.id}
                    activeOpacity={0.7}
                    onPress={() => handleFilterSelect(status.id)}
                    style={[
                      styles.option,
                      isSelected && {
                        backgroundColor: `${status.color}15`,
                        borderColor: status.color,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={status.icon as any}
                      size={28}
                      color={isSelected ? status.color : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && { color: status.color, fontWeight: "700" },
                      ]}
                    >
                      {status.name}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={status.color}
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 6,
      },
    }),
  },

  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#FFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: "70%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  closeBtn: {
    padding: 4,
  },

  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "transparent",
    gap: 12,
  },

  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  checkIcon: {
    marginLeft: 8,
  },
});