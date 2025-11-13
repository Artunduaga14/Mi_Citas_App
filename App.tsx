// App.tsx
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { useColorScheme } from './src/hooks/useColorScheme';
import ProtectedNavigator from './src/navigation/ProtectedNavigator';

// Importa el provider del sistema de alertas
import { AlertNotificationRoot } from 'react-native-alert-notification';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const color = useColorScheme();
  const [loaded] = useFonts({ SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf') });

  if (!loaded) return null;

  return (
    <AlertNotificationRoot>
      <NavigationContainer theme={color === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
      </NavigationContainer>
    </AlertNotificationRoot>
  );
}
