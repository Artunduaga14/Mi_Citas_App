import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { authService } from "../services/Auth/AuthService";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import MainStackNavigator from "./MainStackNavigator";

export default function ProtectedNavigator() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // 1️⃣ Verifica si el access token sigue siendo válido
      const valid = await authService.isAuthenticated();

      // 2️⃣ Si no es válido, intenta refrescarlo
      if (!valid) {
        const refreshed = await authService.refreshTokens(); // 🔄 aquí se usa el refresh
        setIsAuth(refreshed);
      } else {
        setIsAuth(true);
      }
    };

    checkAuth();
  }, []);

  // 3️⃣ Mientras valida, muestra un loader
  if (isAuth === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  // 4️⃣ Decide a dónde mandar al usuario
 return isAuth ? <MainStackNavigator /> : <AuthNavigator />;
}
