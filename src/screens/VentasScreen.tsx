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

interface ProductoSeleccionado {
  id: string;
  cantidad: string;
}

const VentasScreen: React.FC = () => {
  const { productos, ventas, registrarVentaMultiple, logout } = useAppContext();
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);

  const hoy = new Date().toISOString().slice(0, 10);
  const ventasHoy = ventas.filter((v) => v.fecha === hoy);

  const toggleProducto = (productoId: string) => {
    setProductosSeleccionados((prev) => {
      const existe = prev.find((p) => p.id === productoId);
      if (existe) {
        return prev.filter((p) => p.id !== productoId);
      } else {
        return [...prev, { id: productoId, cantidad: '1' }];
      }
    });
  };

  const actualizarCantidad = (productoId: string, cantidad: string) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) => (p.id === productoId ? { ...p, cantidad } : p))
    );
  };

  const handleRegistrar = () => {
    if (productosSeleccionados.length === 0) return;
    
    // Validar que todas las cantidades sean números válidos
    for (const item of productosSeleccionados) {
      const cantidad = Number(item.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        alert('Por favor ingresa cantidades válidas (números mayores a 0)');
        return;
      }
    }
    
    registrarVentaMultiple(productosSeleccionados);
    setProductosSeleccionados([]);
    alert('Venta(s) registrada(s) exitosamente');
  };

  const getNombreProducto = (id: string) =>
    productos.find((p) => p.id === id)?.nombre ?? 'Desconocido';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ventas de hoy ({hoy})</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Registrar múltiples ventas</Text>

        <Text style={styles.label}>Selecciona productos (puedes elegir varios)</Text>
        <View style={styles.chipsContainer}>
          {productos.map((p) => {
            const seleccionado = productosSeleccionados.some((ps) => ps.id === p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.chip,
                  seleccionado && styles.chipSelected,
                ]}
                onPress={() => toggleProducto(p.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    seleccionado && styles.chipTextSelected,
                  ]}
                >
                  {p.nombre} ({p.stockActual})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {productosSeleccionados.length > 0 && (
          <View style={styles.cantidadesContainer}>
            <Text style={styles.label}>Cantidades</Text>
            {productosSeleccionados.map((ps) => {
              const producto = productos.find((p) => p.id === ps.id);
              return (
                <View key={ps.id} style={styles.cantidadRow}>
                  <Text style={styles.cantidadLabel}>{producto?.nombre}</Text>
                  <TextInput
                    style={styles.inputSmall}
                    keyboardType="number-pad"
                    value={ps.cantidad}
                    onChangeText={(text) => {
                      // Solo acepta números
                      if (text === '' || /^\d+$/.test(text)) {
                        actualizarCantidad(ps.id, text);
                      }
                    }}
                    placeholder="Cantidad"
                  />
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            productosSeleccionados.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleRegistrar}
          disabled={productosSeleccionados.length === 0}
        >
          <Text style={styles.buttonText}>
            Registrar {productosSeleccionados.length} venta(s)
          </Text>
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
  cantidadesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cantidadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  cantidadLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f9fafb',
    fontSize: 12,
    width: 80,
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
});

export default VentasScreen;
