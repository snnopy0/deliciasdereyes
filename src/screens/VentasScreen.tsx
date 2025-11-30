import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

const VentasScreen: React.FC = () => {
  const { productos, ventas, registrarVenta, logout } = useAppContext();
  const [productoId, setProductoId] = useState<string>(
    productos[0]?.id ?? '',
  );
  const [cantidad, setCantidad] = useState<string>('');

  const hoy = new Date().toISOString().slice(0, 10);
  const ventasHoy = ventas.filter((v) => v.fecha === hoy);

  const handleRegistrar = () => {
    if (!productoId || !cantidad) return;
    registrarVenta(productoId, Number(cantidad));
    setCantidad('');
  };

  const getNombreProducto = (id: string) =>
    productos.find((p) => p.id === id)?.nombre ?? 'Desconocido';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ventas de hoy ({hoy})</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Registrar nueva venta</Text>

        <Text style={styles.label}>Producto</Text>
        <View style={styles.chipsContainer}>
          {productos.map((p) => {
            const selected = p.id === productoId;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.chip,
                  selected && styles.chipSelected,
                ]}
                onPress={() => setProductoId(p.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected && styles.chipTextSelected,
                  ]}
                >
                  {p.nombre} ({p.stockActual})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Cantidad</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
          placeholder="Ej: 3"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegistrar}>
          <Text style={styles.buttonText}>Registrar venta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ventas registradas hoy</Text>
        {ventasHoy.length === 0 ? (
          <Text style={styles.empty}>No hay ventas registradas hoy.</Text>
        ) : (
          ventasHoy.map((v) => {
            const total = v.cantidad * v.precioUnitario;
            return (
              <View key={v.id} style={styles.row}>
                <Text style={styles.rowTitle}>{getNombreProducto(v.productoId)}</Text>
                <Text style={styles.rowText}>
                  {v.cantidad} × ${v.precioUnitario} = ${total}
                </Text>
              </View>
            );
          })
        )}
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
  label: { fontSize: 13, marginTop: 4, marginBottom: 4, color: '#4b5563' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  chipSelected: { backgroundColor: '#8b5cf6' },
  chipText: { fontSize: 12, color: '#111827' },
  chipTextSelected: { color: '#ffffff' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#ffffff', fontWeight: '600' },
  empty: { fontSize: 13, color: '#6b7280' },
  row: { marginBottom: 8 },
  rowTitle: { fontWeight: '600', fontSize: 14 },
  rowText: { fontSize: 13, color: '#4b5563' },
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

export default VentasScreen;
