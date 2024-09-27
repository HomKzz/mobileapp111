import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './FirebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons'; // ใช้ Ionicons

// Import Screens
import HomeScreen from './Screen/HomeScreen';
import AgendaScreen from './Screen/AgendaScreen';
import SettingsScreen from './Screen/SettingsScreen';
import AuthScreen from './Screen/AuthScreen';
import ReportScreen from './Screen/Report';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Auth screen
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Stack for Home screen
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack for Calendar screen
function CalendarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AgendaScreen" 
        component={AgendaScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
function ReportStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ReportScreen" 
        component={ReportScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack for Settings screen
function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  return (
    <NavigationContainer>
      {user ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === 'หน้าแรก') {
                iconName = 'home-outline'; // ใช้ไอคอน home-outline
              } else if (route.name === 'เหตุการณ์') {
                iconName = 'calendar-outline'; // ใช้ไอคอน calendar-outline
              } else if (route.name === 'ตั้งค่า') {
                iconName = 'settings-outline'; // ใช้ไอคอน settings-outline
              } else if (route.name === 'สรุปผล'){
                iconName = 'newspaper-outline'; // ใช้ไอคอน settings-outline
              }

              // Return the Ionicons component
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen 
            name="หน้าแรก" 
            component={HomeStack} 
            options={{ headerShown: false }}
          />
          <Tab.Screen 
            name="เหตุการณ์" 
            component={CalendarStack} 
            options={{ headerShown: false }}
          />
          <Tab.Screen 
            name="สรุปผล"
            component={ReportStack} 
            options={{ headerShown: false }}
          />
          <Tab.Screen 
            name="ตั้งค่า"
            component={SettingsStack} 
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      ) : ( 
        <AuthStack /> // ถ้ายังไม่ได้ล็อกอิน แสดงหน้า Auth
      )}
    </NavigationContainer>
  );
}
