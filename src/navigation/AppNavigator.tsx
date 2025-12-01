import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '../context/AppContext';
import LoginScreen from '../screens/LoginScreen';
import VentasScreen from '../screens/VentasScreen';
import PedidosScreen from '../screens/PedidosScreen';
import InventarioScreen from '../screens/InventarioScreen';
import IngredientesScreen from '../screens/IngredientesScreen';
import ReportesScreen from '../screens/ReportesScreen';
import RecetasScreen from '../screens/RecetasScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { usuarioActual } = useAppContext();
  const rol = usuarioActual?.rol; // 'VENTAS' o 'PRODUCCION'

  const tabsForRole =
    rol === 'VENTAS'
      ? ['Ventas', 'Pedidos', 'Inventario', 'Ingredientes', 'Recetas', 'Reportes']
      : ['Pedidos', 'Inventario', 'Ingredientes', 'Recetas'];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: !!false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';

          switch (route.name) {
            case 'Ventas':
              iconName = 'cash-outline';
              break;
            case 'Pedidos':
              iconName = 'list-outline';
              break;
            case 'Inventario':
              iconName = 'cube-outline';
              break;
            case 'Ingredientes':
              iconName = 'pizza-outline';
              break;
            case 'Reportes':
              iconName = 'stats-chart-outline';
              break;
            case 'Recetas':
              iconName = 'book-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {tabsForRole.includes('Ventas') && (
        <Tab.Screen name="Ventas" component={VentasScreen} />
      )}
      {tabsForRole.includes('Pedidos') && (
        <Tab.Screen name="Pedidos" component={PedidosScreen} />
      )}
      {tabsForRole.includes('Inventario') && (
        <Tab.Screen name="Inventario" component={InventarioScreen} />
      )}
      {tabsForRole.includes('Ingredientes') && (
        <Tab.Screen name="Ingredientes" component={IngredientesScreen} />
      )}
      {tabsForRole.includes('Recetas') && (
        <Tab.Screen name="Recetas" component={RecetasScreen} />
      )}
      {tabsForRole.includes('Reportes') && (
        <Tab.Screen name="Reportes" component={ReportesScreen} />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { usuarioActual } = useAppContext();

  return (
    <Stack.Navigator screenOptions={{ headerShown: !!false }}>
      {usuarioActual ? (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
