// src/components/DoctorReviewCreateModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { StarRating } from "./StarRating";
import { Ionicons } from "@expo/vector-icons";
import { DoctorReviewService } from "../../services/octor-review.service";

type Props = {
  visible: boolean;
  onClose: () => void;
  doctorId: number;
  userId: number;
  citationId?: number | null;
  onCreated: () => void; // recargar pantalla
};

export const DoctorReviewCreateModal = ({
  visible,
  onClose,
  doctorId,
  userId,
  citationId,
  onCreated,
}: Props) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submit = async () => {
    if (rating < 1) return;

    await DoctorReviewService.create({
      doctorId,
      userId,
      rating,
      comment,
      citationId,
    });

    onCreated();
    onClose();
    setRating(0);
    setComment("");
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Escribir reseña</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#111" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Tu calificación</Text>
          <StarRating value={rating} onChange={setRating} />

          <Text style={[styles.label, { marginTop: 16 }]}>Comentario</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe un comentario..."
            multiline
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity
            onPress={submit}
            style={[styles.btn, { backgroundColor: "#3D7BFF" }]}
          >
            <Text style={styles.btnText}>Enviar reseña</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
      },
      android: { elevation: 8 },
    }),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#111" },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
    borderRadius: 10,
    minHeight: 90,
    textAlignVertical: "top",
    fontSize: 14,
  },
  btn: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
