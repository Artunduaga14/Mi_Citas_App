import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export const TwoFactorModal = ({ visible, onClose, onSubmit }: Props) => {
  const [code, setCode] = useState("");

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Botón de cerrar */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Verificación 2FA</Text>
          <Text style={styles.subtitle}>Ingresa el código enviado a tu correo</Text>

          <TextInput
            placeholder="Código"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
            style={styles.input}
          />

          <TouchableOpacity style={styles.btn} onPress={() => onSubmit(code)}>
            <Text style={styles.btnText}>Verificar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)"
  },
  container: {
    width: "80%", padding: 20, borderRadius: 12,
    backgroundColor: "#fff", position: "relative"
  },
  closeBtn: { position: "absolute", top: 10, right: 10 },
  closeText: { fontSize: 22, fontWeight: "bold", color: "#444" },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: "center", color: "#777", marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 12, fontSize: 16, marginBottom: 15
  },
  btn: {
    backgroundColor: "#5A9FD4",
    paddingVertical: 12, borderRadius: 8
  },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "600" }
});
