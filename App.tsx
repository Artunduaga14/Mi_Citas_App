// App.tsx
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { useColorScheme } from './src/hooks/useColorScheme';
import ProtectedNavigator from './src/navigation/ProtectedNavigator';

// 🧡 Importa el provider del sistema de alertas
import { AlertNotificationRoot } from 'react-native-alert-notification';

export default function App() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });
  if (!loaded) return null;

  return (
    // 🔹 Envolvemos todo con el provider de AlertNotification
    <AlertNotificationRoot theme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <ProtectedNavigator />
      </NavigationContainer>
    </AlertNotificationRoot>
  );
}
