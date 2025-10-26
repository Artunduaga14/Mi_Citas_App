import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AuthNavigator from './AuthNavigator'
import MainNavigator from './MainNavigator'

const Root = createNativeStackNavigator()

export default function AppNavigator() {
  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      <Root.Screen name="Auth" component={AuthNavigator} />
      <Root.Screen name="Main" component={MainNavigator} />
    </Root.Navigator>
  )
}
