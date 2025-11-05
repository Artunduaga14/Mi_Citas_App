// App.tsx
import React from 'react'
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import AppNavigator from './src/navigation/AppNavigator'
import { useColorScheme } from './src/hooks/useColorScheme' // tu hook
import ProtectedNavigator from './src/navigation/ProtectedNavigator'

export default function App() {
  const colorScheme = useColorScheme()

  const [loaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  })
  if (!loaded) return null

  return (
   <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
  <StatusBar style="auto" />
  <ProtectedNavigator />
</NavigationContainer>

  )
}
