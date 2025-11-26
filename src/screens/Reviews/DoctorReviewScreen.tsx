import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { DoctorReviewCreateModal } from "../../components/ui/octorReviewCreateModal";
import { StarRating } from "../../components/ui/StarRating";
import { DoctorReviewService } from "../../services/octor-review.service";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../../services/Auth/AuthService";

export const DoctorReviewScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();

  const { doctorId, citationId } = route.params ?? {};

  const [data, setData] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  // =========================================================
  // 🔥 OBTENER USER ID REAL DESDE EL TOKEN JWT
  // =========================================================
  const loadUserId = async () => {
    const uid = await authService.getUserId();
    setUserId(uid);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await DoctorReviewService.getAll(doctorId);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserId(); // ⬅️ Cargamos el ID del usuario
    load();       // ⬅️ Cargamos la info del doctor
  }, []);

  // Si aún está cargando o no tenemos datos
  if (loading || !data) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 16 }}>Cargando...</Text>
      </View>
    );
  }

  // Si no hay userId (token inválido)
  if (!userId) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 16, color: "red" }}>
          No se pudo obtener el usuario. Inicia sesión nuevamente.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* 🔙 BOTÓN ATRÁS */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#111" />
      </TouchableOpacity>

      {/* ⭐ TARJETA PRINCIPAL */}
      <View style={styles.headerCard}>
        <Image source={{ uri: data.image }} style={styles.avatar} />

        <Text style={styles.name}>{data.fullName}</Text>
        <Text style={styles.specialty}>{data.specialtyName}</Text>

        <Text style={styles.avg}>{data.averageRating.toFixed(1)}</Text>
        <StarRating value={Math.round(data.averageRating)} size={22} />

        <Text style={styles.sub}>{data.totalReviews} calificaciones</Text>

        {/* SOLO MOSTRAR BOTÓN SI TIENE DERECHO A CALIFICAR */}
        <TouchableOpacity style={styles.btn} onPress={() => setOpenModal(true)}>
          <Text style={styles.btnText}>Escribir una reseña</Text>
        </TouchableOpacity>
      </View>

      {/* ⭐ LISTADO DE RESEÑAS */}
      <View style={styles.reviewList}>
        <Text style={styles.sectionTitle}>Opiniones destacadas</Text>

        {data.reviews?.map((r: any) => (
          <View key={r.id} style={styles.reviewItem}>
            <StarRating value={r.rating} size={18} />

            <Text style={styles.date}>
              {new Date(r.dateCreated).toLocaleDateString()}
            </Text>

            <Text style={styles.comment}>{r.comment ?? "Sin comentario"}</Text>
          </View>
        ))}
      </View>

      {/* MODAL PARA CREAR RESEÑA */}
      <DoctorReviewCreateModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        doctorId={doctorId}
        userId={userId}       // 👈 AHORA SÍ ES EL REAL
        citationId={citationId}
        onCreated={load}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  backBtn: {
    marginBottom: 10,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCard: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    marginBottom: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },

  name: { fontSize: 22, fontWeight: "800", marginTop: 4 },

  specialty: { fontSize: 14, color: "#666", marginBottom: 8 },

  avg: { fontSize: 36, fontWeight: "900", marginTop: 6 },

  sub: { fontSize: 14, color: "#777", marginTop: 4 },

  btn: {
    backgroundColor: "#3D7BFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
  },

  btnText: { color: "#fff", fontWeight: "800" },

  reviewList: { marginTop: 10 },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },

  reviewItem: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  date: { fontSize: 12, color: "#777", marginTop: 4 },

  comment: { fontSize: 14, marginTop: 6 },
});
