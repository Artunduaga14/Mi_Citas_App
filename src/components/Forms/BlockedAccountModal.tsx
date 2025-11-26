import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const BlockedAccountModal = ({ visible, onClose, onSubmit }: Props) => {
  const [reason, setReason] = useState("");

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Cuenta bloqueada</Text>
          <Text style={styles.subtitle}>
            Explica brevemente por qué necesitas desbloqueo.
          </Text>

          <TextInput
            placeholder="Escribe tu solicitud..."
            placeholderTextColor="#999"
            value={reason}
            onChangeText={setReason}
            style={styles.input}
            multiline
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={() => onSubmit(reason)}
          >
            <Text style={styles.btnText}>Enviar solicitud</Text>
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
    width: "85%", padding: 20, borderRadius: 12,
    backgroundColor: "#fff", position: "relative"
  },
  closeBtn: { position: "absolute", top: 10, right: 10 },
  closeText: { fontSize: 22, fontWeight: "bold", color: "#444" },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: "center", color: "#777", marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 12, fontSize: 16, minHeight: 90, marginBottom: 15
  },
  btn: {
    backgroundColor: "#5A9FD4",
    paddingVertical: 12, borderRadius: 8
  },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center", fontWeight: "600" }
});
