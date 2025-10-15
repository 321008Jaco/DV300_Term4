import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import IntakeScreen from '../screens/IntakeScreen';
import ResultsScreen from '../screens/ResultsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ListeningScreen from '../screens/ListeningScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ size, color }) => (<MaterialIcons name="home" size={size} color={color} />) }}
      />
      <Tab.Screen
        name="Intake"
        component={IntakeScreen}
        options={{ tabBarIcon: ({ size, color }) => (<MaterialIcons name="assignment" size={size} color={color} />) }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarIcon: ({ size, color }) => (<MaterialIcons name="history" size={size} color={color} />) }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ size, color }) => (<MaterialIcons name="settings" size={size} color={color} />) }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  return (
    <NavigationContainer>
      {loading ? (

        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      ) : user ? (

        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Listening" component={ListeningScreen} />
        </Stack.Navigator>
      ) : (

        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Listening" component={ListeningScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
