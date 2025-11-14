import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { authService } from "../services/Auth/AuthService";
import AuthNavigator from "./AuthNavigator";
import MainStackNavigator from "./MainStackNavigator";
import { LoadingOverlay } from "../utils/LoadingOverlay";
import { useIsFocused } from "@react-navigation/native";
import { notificationSocket } from "../services/socket/notification.socket";

const Stack = createNativeStackNavigator();

export default function ProtectedNavigator() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const isFocused = useIsFocused();   // 👈 SECRETO

  useEffect(() => {
    const check = async () => {
      const valid = await authService.isAuthenticated();

      if (!valid) {
        const refreshed = await authService.refreshTokens();
        setIsAuth(refreshed);
      } else {
        setIsAuth(true);
      }


            // 🚀 CONECTAR SOCKET DE NOTIFICACIONES
      const token = await authService.getToken();
      if (token) {
        await notificationSocket.connect(token);
        console.log("🔔 Notificaciones activadas");
      }


    };

    check();
  }, [isFocused]);   // 👈 SE EJECUTA CADA VEZ QUE ENTRAS A ProtectedNavigator

  if (isAuth === null) return <LoadingOverlay visible={true} />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuth ? (
        <Stack.Screen name="MainStack" component={MainStackNavigator} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
