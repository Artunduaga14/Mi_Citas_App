// LoadingOverlay.tsx
import React from "react";
import { View, ActivityIndicator, StyleSheet, Modal } from "react-native";

interface Props {
  visible: boolean; // Mostrar/ocultar
}

export const LoadingOverlay: React.FC<Props> = ({ visible }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color="#5A9FD4" />
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
    backgroundColor: "rgba(0,0,0,0.3)", // fondo semi-transparente
  },
  box: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
});
