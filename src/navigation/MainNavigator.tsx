import React from 'react'
import { Platform, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/Home/index'
import { HapticTab } from './HapticTab'
import TabBarBackground from '../components/ui/TabBarBackground'
import { Colors } from '../constants/Colors'
import { useColorScheme } from '../hooks/useColorScheme'
import { Ionicons } from '@expo/vector-icons' // usa Ionicons o tu IconSymbol
import TabTwoScreen from '../screens/Notifications/explore'
import RelatedPersonsScreen from '../screens/RelatedPersons/relatedPerson'
import { ReservationView } from '../screens/Reservation/ReservationView'

const Tab = createBottomTabNavigator()

export default function MainNavigator() {
  const colorScheme = useColorScheme()
  const tint = Colors[colorScheme ?? 'light']?.tint ?? '#2f80ed' // azul bonito

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: tint,
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          height: 72,
          paddingHorizontal: 80,
          elevation: 0,
        },
      }}
    >
            { <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: focused ? 52 : 40,
                height: focused ? 52 : 40,
                borderRadius: 999,
                backgroundColor: focused ? tint : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
               
                shadowColor: '#000',
                shadowOpacity: focused ? 0.16 : 0,
                shadowRadius: 70,
                shadowOffset: { width: 0, height: 4 },
                elevation: focused ? 6 : 0,
              }}
            >
              <Ionicons
                name="home"
                size={focused ? 24 : 30}
                color={focused ? '#fff' : '#4b5563'}
              />
            </View>
          ),
        }}
      /> }


      {/* Cuando tengas otras tabs, repite el mismo patrón: */}
       { <Tab.Screen
        name="Notifications"
        component={TabTwoScreen}
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: focused ? 52 : 40,
              height: focused ? 52 : 40,
              borderRadius: 999,
              backgroundColor: focused ? tint : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
          
              shadowColor: '#000',
              shadowOpacity: focused ? 0.16 : 0,
              shadowRadius: 70,
              shadowOffset: { width: 0, height: 4 },
              elevation: focused ? 6 : 0,
            }}>
              <Ionicons
                name="notifications"
                size={focused ? 24 : 30}
                color={focused ? '#fff' : '#4b5563'}
              />
            </View>
          ),
        }}
      />  }

           <Tab.Screen
        name="RelatedPersons"
        component={RelatedPersonsScreen}
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: focused ? 52 : 40,
              height: focused ? 52 : 80,
              borderRadius: 999,
              backgroundColor: focused ? tint : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              // transform: [{ translateY: focused ? -20 : 0 }], // “levanta” el activo
              shadowColor: '#000',
              shadowOpacity: focused ? 0.16 : 0,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: focused ? 6 : 0,
            }}>
              <Ionicons
                name="people"
                size={focused ? 24 : 30}
                color={focused ? '#fff' : '#4b5563'}
              />
            </View>
          ),
        }}
      /> 
      <Tab.Screen
  name="Reservation"
  component={ReservationView}
  options={{
    title: '',
    tabBarIcon: ({ focused }) => (
      <View
        style={{
          width: focused ? 52 : 40,
          height: focused ? 52 : 40,
          borderRadius: 999,
          backgroundColor: focused ? tint : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: focused ? 0.16 : 0,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: focused ? 6 : 0,
        }}
      >
        <Ionicons
          name="calendar"
          size={focused ? 24 : 30}
          color={focused ? '#fff' : '#4b5563'}
        />
      </View>
    ),
  }}
/>

    </Tab.Navigator>
  )
}
