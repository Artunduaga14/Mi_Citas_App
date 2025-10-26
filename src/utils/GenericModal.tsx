import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Text } from "react-native";

interface Props {
  visible: boolean;                // si se muestra o no
  onClose: () => void;             // función para cerrar
  children: React.ReactNode;       // el contenido que quieras renderizar
  title?: string;                  // opcional: título del modal
}

export const GenericModal: React.FC<Props> = ({ visible, onClose, children, title }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Cabecera opcional */}
          {title && <Text style={styles.title}>{title}</Text>}

          {/* Contenido dinámico */}
          <View style={styles.content}>{children}</View>

          {/* Botón de cerrar */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  content: {
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: "#5A9FD4",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "white",
    fontWeight: "600",
  },
});
