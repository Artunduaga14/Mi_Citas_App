import React from 'react'
import { View, StyleSheet } from 'react-native'

export default function TabBarBackground() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bg} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end', // empuja el fondo hacia abajo dentro del wrapper
    marginBottom: 15, 
    paddingHorizontal: 12,          // ⚡ levanta visualmente la barra del borde inferior
  },
  bg: {
    height: 70,                 // altura de la barra
    backgroundColor: '#fff',
    borderRadius: 24,           // esquinas redondeadas

    // 🌫️ sombra iOS


    // 🌫️ sombra Android
  
  },
})
