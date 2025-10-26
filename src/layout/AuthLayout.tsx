// components/projectComponents/layout/AuthLayout.tsx
import React from "react";
import {
  View,
  Image,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { WaveTop } from "../utils/HaveTop";
// Si quieres volver a usar la onda, regrésala después de confirmar que no hay warning
// import { WaveTop } from "@/components/projectComponents/utils/HaveTop";

interface Props {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require("../../assets/images/loginimages/font2.png")}
          style={styles.header}
          imageStyle={styles.headerImage}
          resizeMode="cover"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/icons/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>

        <View style={styles.formContainer}>
          {/* Si luego quieres, descomenta la WaveTop */}
          <View style={styles.wave}><WaveTop /></View> 
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { flexGrow: 1 },
  header: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerImage: {
    // Opcional: mismo redondeo si algún día lo necesitas
    // borderBottomLeftRadius: 0,
    // borderBottomRightRadius: 0,
  },
  logoContainer: {
    alignItems: "center",
    zIndex: 10,
  },
  logoImage: { width: 180, height: 180 },
  formContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: -50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    flex: 1,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  wave: { position: "absolute", top: -70, left: 0, right: 0, zIndex: 1 },
});
