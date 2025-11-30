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

const PedidosScreen: React.FC = () => {
  const {
    productos,
    pedidos,
    registrarPedido,
    actualizarEstadoPedido,
    logout,
  } = useAppContext();

  const [cliente, setCliente] = useState('');
  const [productoId, setProductoId] = useState<string>(
    productos[0]?.id ?? '',
  );
  const [cantidad, setCantidad] = useState<string>('');

  const handleRegistrar = () => {
    if (!cliente || !productoId || !cantidad) return;
    registrarPedido(cliente, productoId, Number(cantidad));
    setCliente('');
    setCantidad('');
  };

  const getNombreProducto = (id: string) =>
    productos.find((p) => p.id === id)?.nombre ?? 'Desconocido';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pedidos</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nuevo pedido</Text>

        <Text style={styles.label}>Cliente</Text>
        <TextInput
          style={styles.input}
          value={cliente}
          onChangeText={setCliente}
          placeholder="Nombre del cliente"
        />

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
                  {p.nombre}
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
          placeholder="Ej: 6"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegistrar}>
          <Text style={styles.buttonText}>Registrar pedido</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pedidos registrados</Text>
        {pedidos.length === 0 ? (
          <Text style={styles.empty}>No hay pedidos registrados.</Text>
        ) : (
          pedidos.map((p) => (
            <View
              key={p.id}
              style={[
                styles.row,
                p.estado === 'pendiente' && styles.rowPending,
              ]}
            >
              <Text style={styles.rowTitle}>{p.cliente}</Text>
              <Text style={styles.rowText}>
                {p.fecha} · {getNombreProducto(p.productoId)} · {p.cantidad} und.
              </Text>
              <Text style={styles.rowText}>
                Estado: {p.estado === 'pendiente' ? 'Pendiente' : 'Entregado'}
              </Text>
              {p.estado === 'pendiente' && (
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => actualizarEstadoPedido(p.id, 'entregado')}
                >
                  <Text style={styles.smallButtonText}>Marcar entregado</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
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
  row: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  rowPending: {
    borderWidth: 1,
    borderColor: '#f97316',
  },
  rowTitle: { fontWeight: '600', fontSize: 14 },
  rowText: { fontSize: 13, color: '#4b5563' },
  smallButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  smallButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
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

export default PedidosScreen;
