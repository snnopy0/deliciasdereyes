import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppContext } from '../context/AppContext';

const ReportesScreen: React.FC = () => {
  const { productos, ventas, logout } = useAppContext();

  if (ventas.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>Reportes de ventas</Text>
        <Text style={styles.empty}>
          Aún no hay ventas registradas para generar reportes.
        </Text>
        <View style={styles.logoutContainer}>
          <Text style={{ marginBottom: 6 }}>¿Cambiar de usuario?</Text>
          <Text
            style={styles.logoutLink}
            onPress={logout}
          >
            Cerrar sesión
          </Text>
        </View>
      </View>
    );
  }

  const totalesPorProducto: Record<
    string,
    { cantidad: number; monto: number }
  > = {};

  ventas.forEach((v) => {
    if (!totalesPorProducto[v.productoId]) {
      totalesPorProducto[v.productoId] = { cantidad: 0, monto: 0 };
    }
    totalesPorProducto[v.productoId].cantidad += v.cantidad;
    totalesPorProducto[v.productoId].monto +=
      v.cantidad * v.precioUnitario;
  });

  const filas = Object.entries(totalesPorProducto).map(
    ([productoId, data]) => {
      const p = productos.find((prod) => prod.id === productoId);
      return {
        id: productoId,
        nombre: p?.nombre ?? 'Desconocido',
        cantidad: data.cantidad,
        monto: data.monto,
      };
    },
  );

  const top = [...filas]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const totalGeneral = filas.reduce(
    (acc, f) => acc + f.monto,
    0,
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reportes de ventas</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Totales por producto</Text>
        {filas.map((f) => (
          <View key={f.id} style={styles.row}>
            <Text style={styles.rowTitle}>{f.nombre}</Text>
            <Text style={styles.rowText}>
              Cantidad vendida: {f.cantidad} und.
            </Text>
            <Text style={styles.rowText}>Monto total: ${f.monto}</Text>
          </View>
        ))}
        <Text style={styles.totalGeneral}>
          Total general vendido: ${totalGeneral}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top 5 productos más vendidos</Text>
        {top.map((f, index) => (
          <Text key={f.id} style={styles.topItem}>
            {index + 1}. {f.nombre} – {f.cantidad} und.
          </Text>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <Text style={{ marginBottom: 6 }}>¿Cambiar de usuario?</Text>
        <Text
          style={styles.logoutLink}
          onPress={logout}
        >
          Cerrar sesión
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f3ff' },
  center: { justifyContent: 'center', alignItems: 'center' },
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
  row: { marginBottom: 8 },
  rowTitle: { fontWeight: '600', fontSize: 14 },
  rowText: { fontSize: 13, color: '#4b5563' },
  totalGeneral: {
    marginTop: 8,
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
  },
  topItem: { fontSize: 13, color: '#4b5563', marginBottom: 4 },
  empty: { fontSize: 13, color: '#6b7280', marginTop: 8 },
  logoutContainer: {
    marginTop: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutLink: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default ReportesScreen;
