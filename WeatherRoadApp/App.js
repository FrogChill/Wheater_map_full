import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from './screens/MapScreen';
import AddMarkerScreen from './screens/AddMarkerScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Map') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Add') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ title: 'Žemėlapis' }}
        />
        <Tab.Screen 
          name="Add" 
          component={AddMarkerScreen} 
          options={{ title: 'Pridėti žymą' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}