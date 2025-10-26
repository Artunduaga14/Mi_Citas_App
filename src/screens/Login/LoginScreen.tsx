import { GenericForm } from "../../components/Forms/GenericForm";
import { AuthLayout } from "../../layout/AuthLayout";
import { GenericModal } from "../../utils/GenericModal";
import { LoadingOverlay } from "../../utils/LoadingOverlay";
import { FieldConfig } from "../../models/Models";
import { HttpService } from "../../services/GenericServices";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { useNavigation, ParamListBase, NavigationProp } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [loading, setLoading] = useState(false);

  // Estado de modales
  const [showForgot, setShowForgot] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // ================= FORM FIELDS =================
  const loginFields: FieldConfig[] = [
    { name: "email", label: "Correo", type: "email", required: true, placeholder: "Ingrese su correo electrónico" },
    { name: "password", label: "Contraseña", type: "password", required: true, placeholder: "Ingrese su contraseña" },
  ];

  const forgotFields: FieldConfig[] = [
    { name: "email", label: "Correo", type: "email", required: true, placeholder: "Ingrese su correo registrado" },
  ];

  const registerFields: FieldConfig[] = [
    { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Ingrese su nombre" },
    { name: "email", label: "Correo", type: "email", required: true, placeholder: "Ingrese su correo electrónico" },
    { name: "password", label: "Contraseña", type: "password", required: true, placeholder: "Cree una contraseña" },
  ];

  // ================= HANDLERS =================
  const handleLogin = async (data: any) => {
    try {
      setLoading(true);
      const response = await HttpService.login("user", data);

      if (response.status) {
        Alert.alert("✅ Login correcto", "Bienvenido");
        // Resetea el árbol y entra a Main (tus tabs). La tab por defecto será Home.
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });

        // Si quieres ir a una screen específica dentro de Main (por ejemplo la tab 'Home'):
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: "Main", params: { screen: "Home" } }],
        // })
      } else {
        Alert.alert("❌ Error", "Credenciales incorrectas");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("⚠️ Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (data: any) => {
    try {
      setLoading(true);
      const response = await HttpService.forgotPassword(data);
      if (response.status) {
        Alert.alert("✅ Correo enviado", "Revisa tu bandeja para continuar");
        setShowForgot(false);
      } else {
        Alert.alert("❌ Error", "Correo no existe");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("⚠️ Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      // Llama a tu endpoint de registro real
      Alert.alert("✅ Registro exitoso", "Ya puedes iniciar sesión");
      setShowRegister(false);
    } catch (error: any) {
      console.error(error);
      Alert.alert("⚠️ Error", "No se pudo completar el registro");
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER =================
  return (
    <>
      <AuthLayout>
        <Text style={styles.title}>Inicio de sesión</Text>

        <GenericForm fields={loginFields} onSubmit={handleLogin} submitLabel="Iniciar sesión" />

        <TouchableOpacity onPress={() => setShowForgot(true)} style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>¿Olvidó su contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowRegister(true)} style={styles.registerContainer}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </AuthLayout>

      <LoadingOverlay visible={loading} />

      <GenericModal visible={showForgot} onClose={() => setShowForgot(false)} title="Recuperar contraseña">
        <GenericForm fields={forgotFields} onSubmit={handleForgot} submitLabel="Recuperar" />
      </GenericModal>

      <GenericModal visible={showRegister} onClose={() => setShowRegister(false)} title="Crear cuenta">
        <GenericForm fields={registerFields} onSubmit={handleRegister} submitLabel="Registrarse" />
      </GenericModal>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "600", color: "#5A9FD4", textAlign: "center", marginBottom: 30 },
  forgotPasswordContainer: { alignItems: "center", marginTop: 15 },
  forgotPasswordText: { fontSize: 14, color: "#7F8C8D", textDecorationLine: "underline" },
  registerContainer: { alignItems: "center", marginTop: 20 },
  registerText: { fontSize: 14, color: "#7F8C8D" },
  registerLink: { color: "#5A9FD4", fontWeight: "600", textDecorationLine: "underline" },
});
