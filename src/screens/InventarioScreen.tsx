import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

const InventarioScreen: React.FC = () => {
  const { productos, ajustarStock, logout } = useAppContext();

  const porAcabarse = productos.filter(
    (p) => p.stockActual <= p.stockMinimo,
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Inventario</Text>

      <View style={styles.cardHighlight}>
        <Text style={styles.sectionTitle}>Se acabará pronto</Text>
        {porAcabarse.length === 0 ? (
          <Text style={styles.empty}>No hay productos críticos.</Text>
        ) : (
          porAcabarse.map((p) => (
            <View key={p.id} style={styles.highlightRow}>
              <Text style={styles.highlightName}>{p.nombre}</Text>
              <Text style={styles.highlightText}>
                Stock: {p.stockActual} {p.unidad} (mínimo {p.stockMinimo})
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Todos los productos</Text>
        {productos.map((p) => {
          const critical = p.stockActual <= p.stockMinimo;
          return (
            <View
              key={p.id}
              style={[
                styles.row,
                critical && styles.rowCritical,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{p.nombre}</Text>
                <Text style={styles.rowText}>
                  Stock: {p.stockActual} {p.unidad} · Mínimo: {p.stockMinimo}
                </Text>
              </View>
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => ajustarStock(p.id, -1)}
                >
                  <Text style={styles.smallButtonText}>-1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => ajustarStock(p.id, 1)}
                >
                  <Text style={styles.smallButtonText}>+1</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f3ff' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4, color: '#111827' },
  cardHighlight: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  empty: { fontSize: 13, color: '#6b7280' },
  highlightRow: { marginBottom: 8 },
  highlightName: { fontWeight: '600', fontSize: 14 },
  highlightText: { fontSize: 13, color: '#4b5563' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  rowCritical: { borderWidth: 1, borderColor: '#f97316' },
  rowTitle: { fontWeight: '600', fontSize: 14 },
  rowText: { fontSize: 13, color: '#4b5563' },
  buttonsRow: { flexDirection: 'row', gap: 6 },
  smallButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  smallButtonText: { fontSize: 13, fontWeight: '600', color: '#111827' },
  logoutContainer: {
    marginTop: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ef4444',
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default InventarioScreen;
