import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useAppContext } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import VentasScreen from './src/screens/VentasScreen';
import PedidosScreen from './src/screens/PedidosScreen';
import InventarioScreen from './src/screens/InventarioScreen';
import ReportesScreen from './src/screens/ReportesScreen';

type TabId = 'Ventas' | 'Pedidos' | 'Inventario' | 'Reportes';

const MainLayout: React.FC = () => {
  const { usuarioActual } = useAppContext();
  const rol = usuarioActual?.rol; // 'VENTAS' o 'PRODUCCION'

  const availableTabs: TabId[] =
    rol === 'VENTAS'
      ? ['Ventas', 'Pedidos', 'Inventario', 'Reportes']
      : ['Pedidos', 'Inventario'];

  const [activeTab, setActiveTab] = useState<TabId>(availableTabs[0]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Ventas':
        return <VentasScreen />;
      case 'Pedidos':
        return <PedidosScreen />;
      case 'Inventario':
        return <InventarioScreen />;
      case 'Reportes':
        return <ReportesScreen />;
      default:
        return null;
    }
  };

  const renderIcon = (tab: TabId, isActive: boolean) => {
    let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';

    switch (tab) {
      case 'Ventas':
        iconName = 'cash-outline';
        break;
      case 'Pedidos':
        iconName = 'list-outline';
        break;
      case 'Inventario':
        iconName = 'cube-outline';
        break;
      case 'Reportes':
        iconName = 'stats-chart-outline';
        break;
    }

    const color = isActive ? '#8b5cf6' : '#6b7280';
    return <Ionicons name={iconName} size={22} color={color} />;
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <View style={styles.content}>{renderContent()}</View>

      <View style={styles.tabBar}>
        {availableTabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              {renderIcon(tab, isActive)}
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const Root: React.FC = () => {
  const { usuarioActual } = useAppContext();

  if (!usuarioActual) {
    return <LoginScreen />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingVertical: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabItemActive: {
    backgroundColor: '#f3e8ff',
  },
  tabLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
});
