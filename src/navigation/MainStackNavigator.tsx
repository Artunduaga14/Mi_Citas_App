import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainNavigator from "./MainNavigator";
import PersonProfile from "../screens/Perfil/PersonPerfil";
import { ReservationView } from "../screens/Reservation/ReservationView";
import NotificationsScreen from "../screens/Notifications/NotificationScreen";
import { DoctorReviewScreen } from "../screens/Reviews/DoctorReviewScreen";

// 👉 TIPADO DEL NAVEGADOR PRINCIPAL
export type MainStackParamList = {
  MainTabs: undefined;
  Perfil: undefined;
  ReservationView: undefined;
  NotificationsScreen: undefined;

  // 👉 AQUÍ ESTA TU PANTALLA NUEVA BIEN TIPADA
  DoctorReviewScreen: {
    doctorId: number;
    citationId: number;
  };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="Perfil" component={PersonProfile} />
      <Stack.Screen name="ReservationView" component={ReservationView} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="DoctorReviewScreen" component={DoctorReviewScreen} />
    </Stack.Navigator>
  );
}
