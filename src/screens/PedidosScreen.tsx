import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

interface ProductoSeleccionado {
  id: string;
  cantidad: string;
}

interface PedidoGrupo {
  key: string; // cliente|fecha
  cliente: string;
  fecha: string;
  items: {
    id: string;
    productoId: string;
    cantidad: number;
    estado: 'pendiente' | 'entregado';
  }[];
  tienePendiente: boolean;
}

const PedidosScreen: React.FC = () => {
  const {
    productos,
    pedidos,
    registrarPedidoMultiple,
    actualizarEstadoPedido,
    eliminarPedido,
    logout,
  } = useAppContext();

  const [cliente, setCliente] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] =
    useState<ProductoSeleccionado[]>([]);

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
      prev.map((p) => (p.id === productoId ? { ...p, cantidad } : p)),
    );
  };

  const getNombreProducto = (id: string) =>
    productos.find((p) => p.id === id)?.nombre ?? 'Desconocido';

  const handleRegistrar = () => {
    if (!cliente || productosSeleccionados.length === 0) {
      Alert.alert(
        'Datos incompletos',
        'Por favor ingresa el nombre del cliente y selecciona al menos un producto.',
      );
      return;
    }

    // Validar cantidades
    for (const item of productosSeleccionados) {
      const cantidad = Number(item.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        Alert.alert(
          'Cantidad inválida',
          'Por favor ingresa cantidades válidas (números mayores a 0).',
        );
        return;
      }
    }

    // Registrar en el contexto (no muestra alert)
    registrarPedidoMultiple(cliente, productosSeleccionados);

    // Crear resumen para UNA sola alerta
    const totalProductos = productosSeleccionados.reduce(
      (acc, item) => acc + Number(item.cantidad || 0),
      0,
    );

    const lineas = productosSeleccionados
      .map((item) => {
        const nombreProducto = getNombreProducto(item.id);
        const cantidadNum = Number(item.cantidad || 0);
        return `${nombreProducto} · ${cantidadNum} und.`;
      })
      .join('\n');

    const mensaje =
      `${cliente}\n` +
      `${totalProductos} producto(s):\n\n` +
      lineas;

    Alert.alert('Pedido registrado', mensaje);

    // Limpiar formulario
    setCliente('');
    setProductosSeleccionados([]);
  };

  const confirmarEliminarGrupo = (grupo: PedidoGrupo) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar el pedido de "${grupo.cliente}" del ${grupo.fecha}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const ids = grupo.items.map((item) => item.id);
            eliminarPedido(ids); // 👈 elimina TODA la lista del grupo
            Alert.alert('Éxito', 'Pedido eliminado exitosamente');
          },
        },
      ],
    );
  };

  const marcarGrupoEntregado = (grupo: PedidoGrupo) => {
    grupo.items.forEach((item) => {
      if (item.estado === 'pendiente') {
        actualizarEstadoPedido(item.id, 'entregado');
      }
    });
  };

  // Agrupar pedidos por cliente + fecha
  const grupos: PedidoGrupo[] = (() => {
    const mapa: { [key: string]: PedidoGrupo } = {};

    pedidos.forEach((p) => {
      const key = `${p.cliente}|${p.fecha}`;
      if (!mapa[key]) {
        mapa[key] = {
          key,
          cliente: p.cliente,
          fecha: p.fecha,
          items: [],
          tienePendiente: false,
        };
      }
      mapa[key].items.push({
        id: p.id,
        productoId: p.productoId,
        cantidad: p.cantidad,
        estado: p.estado,
      });
      if (p.estado === 'pendiente') {
        mapa[key].tienePendiente = true;
      }
    });

    return Object.values(mapa);
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pedidos</Text>

      {/* NUEVO PEDIDO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nuevo pedido</Text>

        <Text style={styles.label}>Cliente</Text>
        <TextInput
          style={styles.input}
          value={cliente}
          onChangeText={setCliente}
          placeholder="Nombre del cliente"
        />

        <Text style={styles.label}>Productos (puedes elegir varios)</Text>
        <View style={styles.chipsContainer}>
          {productos.map((p) => {
            const seleccionado = productosSeleccionados.some(
              (ps) => ps.id === p.id,
            );
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, seleccionado && styles.chipSelected]}
                onPress={() => toggleProducto(p.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    seleccionado && styles.chipTextSelected,
                  ]}
                >
                  {p.nombre}
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
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            Registrar pedido ({productosSeleccionados.length} producto(s))
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE PEDIDOS AGRUPADOS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pedidos registrados</Text>
        {grupos.length === 0 ? (
          <Text style={styles.empty}>No hay pedidos registrados.</Text>
        ) : (
          grupos.map((grupo) => {
            const estadoTexto = grupo.tienePendiente
              ? 'Pendiente'
              : 'Entregado';

            return (
              <View
                key={grupo.key}
                style={[
                  styles.row,
                  grupo.tienePendiente && styles.rowPending,
                ]}
              >
                <Text style={styles.rowTitle}>{grupo.cliente}</Text>
                <Text style={styles.rowText}>{grupo.fecha}</Text>

                {grupo.items.map((item) => (
                  <Text key={item.id} style={styles.rowText}>
                    {getNombreProducto(item.productoId)} · {item.cantidad} und.
                  </Text>
                ))}

                <Text style={[styles.rowText, { marginTop: 4 }]}>
                  Estado: {estadoTexto}
                </Text>

                <View style={styles.rowButtons}>
                  {grupo.tienePendiente ? (
                    <TouchableOpacity
                      style={styles.buttonEntregado}
                      onPress={() => marcarGrupoEntregado(grupo)}
                    >
                      <Text style={styles.buttonEntregadoText}>
                        Marcar entregado
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.buttonEntregadoDisabled}>
                      <Text style={styles.buttonEntregadoDisabledText}>
                        Entregado
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.buttonEliminar}
                    onPress={() => confirmarEliminarGrupo(grupo)}
                  >
                    <Text style={styles.buttonEliminarText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
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
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
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
  rowButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    alignItems: 'center',
  },
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
  buttonEntregado: {
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  buttonEntregadoText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  buttonEntregadoDisabled: {
    backgroundColor: '#9ca3af',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  buttonEntregadoDisabledText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  buttonEliminar: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  buttonEliminarText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default PedidosScreen;
