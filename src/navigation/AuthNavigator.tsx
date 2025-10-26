import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// pantallas de autenticación
import LoginScreen from '../screens/Login/LoginScreen'


const Stack = createNativeStackNavigator()

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />

    </Stack.Navigator>
  )
}
