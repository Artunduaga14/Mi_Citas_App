import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";

import { GenericForm } from "../../components/Forms/GenericForm";
import { AuthLayout } from "../../layout/AuthLayout";
import { LoadingOverlay } from "../../utils/LoadingOverlay";
import { FieldConfig } from "../../models/Models";
import { HttpService } from "../../services/GenericServices";
import { twoFactorService } from "../../services/Auth/TwoFactorService";
import { authService } from "../../services/Auth/AuthService";
import { ModificationRequestService } from "../../services/modification-request.service";

import { useNavigation, ParamListBase, NavigationProp } from "@react-navigation/native";
import { TwoFactorModal } from "../../components/animations/TwoFactorModal";
import { BlockedAccountModal } from "../../components/Forms/BlockedAccountModal";

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [loading, setLoading] = useState(false);

  const [show2FA, setShow2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState<number | null>(null);

  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedUserId, setBlockedUserId] = useState<number | null>(null);

  const loginFields: FieldConfig[] = [
    { name: "email", label: "Correo", type: "email", required: true },
    { name: "password", label: "Contraseña", type: "password", required: true }
  ];

  const handleLogin = async (data: any) => {
    try {
      setLoading(true);

      const response = await HttpService.login("user", data);
      const r = response.data;

      // ⭐ Cuenta bloqueada → abrir modal de solicitud
      if (r.isBlocked) {
        setBlockedUserId(r.userId);
        setShowBlockedModal(true);
        return;
      }

      // ⭐ 2FA
      if (r.requiresTwoFactor) {
        setTempUserId(r.userId);
        setShow2FA(true);
        return;
      }

      // ⭐ Login normal
      await authService.setTokens(r.accessToken, r.refreshToken);

      navigation.reset({
        index: 0,
        routes: [{ name: "Protected" }]
      });

    } catch (error) {
      Alert.alert("⚠️ Error", "Credenciales inválidas o servidor no disponible.");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Enviar solicitud de desbloqueo
  const handleSubmitUnblock = async (reason: string) => {
    if (!blockedUserId) return;

    try {
      setLoading(true);

      await ModificationRequestService.create({
        reason,
        typeRequest: 0,
        userId: blockedUserId,
        startDate: null,
        endDate: null,
        statustypesId: 7,
        observation: " "
      });

      setShowBlockedModal(false);

      Alert.alert("📝 Solicitud enviada", "Tu solicitud de desbloqueo fue enviada correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (code: string) => {
    if (!tempUserId) return;

    try {
      setLoading(true);
      const result = await twoFactorService.verify(tempUserId, code);

      await authService.setTokens(result.accessToken, result.refreshToken);

      setShow2FA(false);

      navigation.reset({
        index: 0,
        routes: [{ name: "Protected" }]
      });
    } catch (error) {
      Alert.alert("❌ Código inválido", "Verifica tu código e inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthLayout>
        <Text style={styles.title}>Inicio de sesión</Text>

        <GenericForm fields={loginFields} onSubmit={handleLogin} submitLabel="Iniciar sesión" />

        <TouchableOpacity
  style={styles.registerContainer}
  onPress={() => navigation.navigate("Register")} // ⬅️ AQUÍ
>
  <Text style={styles.registerText}>
    ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
  </Text>
</TouchableOpacity>

      </AuthLayout>

      <LoadingOverlay visible={loading} />

      <TwoFactorModal
        visible={show2FA}
        onClose={() => setShow2FA(false)}
        onSubmit={handleVerify2FA}
      />

      <BlockedAccountModal
        visible={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        onSubmit={handleSubmitUnblock}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "600", color: "#5A9FD4", textAlign: "center", marginBottom: 30 },
  registerContainer: { alignItems: "center", marginTop: 20 },
  registerText: { fontSize: 14, color: "#7F8C8D" },
  registerLink: { color: "#5A9FD4", fontWeight: "600", textDecorationLine: "underline" }
});
