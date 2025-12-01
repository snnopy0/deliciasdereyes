import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

const RecetasScreen: React.FC = () => {
  const { productos, ingredientes, recetas, guardarRecetaProducto, obtenerRecetaProducto, calcularCostoProduccion, logout, productoRecetaEditar, setProductoRecetaEditar } = useAppContext();
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>(productos[0]?.id ?? '');
  const [modalVisible, setModalVisible] = useState(false);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<
    { ingredienteId: string; cantidad: string }[]
  >([]);

  // Si se navega desde Inventario, usar el producto pasado
  React.useEffect(() => {
    if (productoRecetaEditar && productos.find((p) => p.id === productoRecetaEditar)) {
      setProductoSeleccionado(productoRecetaEditar);
      setProductoRecetaEditar(null); // Limpiar después de usar
    }
  }, [productoRecetaEditar, productos, setProductoRecetaEditar]);

  const handleAgregarIngrediente = (ingredienteId: string) => {
    if (!ingredientesSeleccionados.find((i) => i.ingredienteId === ingredienteId)) {
      setIngredientesSeleccionados([...ingredientesSeleccionados, { ingredienteId, cantidad: '0' }]);
    }
  };

  const handleEliminarIngrediente = (ingredienteId: string) => {
    setIngredientesSeleccionados(ingredientesSeleccionados.filter((i) => i.ingredienteId !== ingredienteId));
  };

  const handleActualizarCantidad = (ingredienteId: string, cantidad: string) => {
    setIngredientesSeleccionados(
      ingredientesSeleccionados.map((i) =>
        i.ingredienteId === ingredienteId ? { ...i, cantidad } : i
      )
    );
  };

  const handleGuardarReceta = () => {
    if (ingredientesSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un ingrediente');
      return;
    }

    // Validar que todas las cantidades sean válidas
    for (const item of ingredientesSeleccionados) {
      const cantidad = Number(item.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        alert('Por favor ingresa cantidades válidas (mayores a 0)');
        return;
      }
    }

    guardarRecetaProducto(
      productoSeleccionado,
      ingredientesSeleccionados.map((i) => ({
        ingredienteId: i.ingredienteId,
        cantidad: Number(i.cantidad),
      }))
    );
    setIngredientesSeleccionados([]);
    setModalVisible(false);
    alert('Receta guardada exitosamente');
  };

  const abrirEditarReceta = () => {
    const receta = obtenerRecetaProducto(productoSeleccionado);
    if (receta) {
      setIngredientesSeleccionados(
        receta.ingredientes.map((i) => ({
          ingredienteId: i.ingredienteId,
          cantidad: i.cantidad.toString(),
        }))
      );
    } else {
      setIngredientesSeleccionados([]);
    }
    setModalVisible(true);
  };

  const productoActual = productos.find((p) => p.id === productoSeleccionado);
  const recetaActual = obtenerRecetaProducto(productoSeleccionado);
  const costoProduccion = calcularCostoProduccion(productoSeleccionado, 1);
  const ganancia = productoActual ? productoActual.precioVenta - costoProduccion : 0;
  const margenGanancia = productoActual ? ((ganancia / productoActual.precioVenta) * 100).toFixed(2) : 0;

  const getUnidadLabel = (tipoUnidad: string): string => {
    switch (tipoUnidad) {
      case 'kg':
        return 'kg';
      case 'litros':
        return 'L';
      case 'unitarios':
        return 'und.';
      default:
        return '';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Recetas de Productos</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Selecciona un producto</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productosScrollView}>
          {productos.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.productoChip,
                productoSeleccionado === p.id && styles.productoChipSelected,
              ]}
              onPress={() => setProductoSeleccionado(p.id)}
            >
              <Text
                style={[
                  styles.productoChipText,
                  productoSeleccionado === p.id && styles.productoChipTextSelected,
                ]}
              >
                {p.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {productoActual && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{productoActual.nombre}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Precio de venta:</Text>
            <Text style={styles.infoValue}>${productoActual.precioVenta.toFixed(2)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Costo de producción:</Text>
            <Text style={[styles.infoValue, { color: '#ef4444' }]}>-${costoProduccion.toFixed(2)}</Text>
          </View>

          <View style={[styles.infoRow, styles.gananciaRow]}>
            <Text style={styles.gananciaLabel}>Ganancia por unidad:</Text>
            <View style={styles.gananciaContainer}>
              <Text style={styles.gananciaValue}>${ganancia.toFixed(2)}</Text>
              <Text style={styles.margenValue}>({margenGanancia}%)</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.buttonEditarReceta} onPress={abrirEditarReceta}>
            <Text style={styles.buttonEditarRecetaText}>
              {recetaActual ? '✎ Editar Receta' : '+ Crear Receta'}
            </Text>
          </TouchableOpacity>

          {recetaActual && recetaActual.ingredientes.length > 0 && (
            <View style={styles.recetaContainer}>
              <Text style={styles.recetaTitle}>Ingredientes utilizados:</Text>
              {recetaActual.ingredientes.map((item) => {
                const ingrediente = ingredientes.find((i) => i.id === item.ingredienteId);
                return (
                  <View key={item.ingredienteId} style={styles.ingredienteRow}>
                    <Text style={styles.ingredienteNombre}>{ingrediente?.nombre}</Text>
                    <Text style={styles.ingredienteCantidad}>
                      {item.cantidad} {getUnidadLabel(ingrediente?.tipoUnidad || '')}
                    </Text>
                    <Text style={styles.ingredienteCosto}>
                      ${(ingrediente ? ingrediente.precioUnitario * item.cantidad : 0).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para editar receta */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Receta: {productoActual?.nombre}</Text>

            <Text style={styles.modalLabel}>Ingredientes</Text>
            <View style={styles.ingredientesListContainer}>
              {ingredientesSeleccionados.map((item) => {
                const ingrediente = ingredientes.find((i) => i.id === item.ingredienteId);
                return (
                  <View key={item.ingredienteId} style={styles.ingredienteEditRow}>
                    <View style={styles.ingredienteEditInfo}>
                      <Text style={styles.ingredienteEditNombre}>{ingrediente?.nombre}</Text>
                      <Text style={styles.ingredienteEditPrecio}>
                        ${ingrediente?.precioUnitario.toFixed(2)}/{getUnidadLabel(ingrediente?.tipoUnidad || '')}
                      </Text>
                    </View>
                    <TextInput
                      style={styles.ingredienteEditInput}
                      keyboardType="number-pad"
                      value={item.cantidad}
                      onChangeText={(text) => {
                        if (text === '' || /^\d+\.?\d*$/.test(text)) {
                          handleActualizarCantidad(item.ingredienteId, text);
                        }
                      }}
                      placeholder="0"
                    />
                    <Text style={styles.ingredienteEditUnidad}>{getUnidadLabel(ingrediente?.tipoUnidad || '')}</Text>
                    <TouchableOpacity
                      style={styles.ingredienteDeleteButton}
                      onPress={() => handleEliminarIngrediente(item.ingredienteId)}
                    >
                      <Text style={styles.ingredienteDeleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <Text style={styles.modalLabel}>Agregar ingrediente</Text>
            <View style={styles.agregarIngredienteContainer}>
              {ingredientes
                .filter((i) => !ingredientesSeleccionados.find((s) => s.ingredienteId === i.id))
                .map((i) => (
                  <TouchableOpacity
                    key={i.id}
                    style={styles.agregarIngredienteButton}
                    onPress={() => handleAgregarIngrediente(i.id)}
                  >
                    <Text style={styles.agregarIngredienteButtonText}>+ {i.nombre}</Text>
                  </TouchableOpacity>
                ))}
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleGuardarReceta}
              >
                <Text style={styles.modalButtonText}>Guardar Receta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  productosScrollView: { marginBottom: 8 },
  productoChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  productoChipSelected: { backgroundColor: '#8b5cf6' },
  productoChipText: { fontSize: 13, color: '#111827', fontWeight: '500' },
  productoChipTextSelected: { color: '#ffffff' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoLabel: { fontSize: 14, fontWeight: '500', color: '#4b5563' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#8b5cf6' },
  gananciaRow: { borderBottomWidth: 0, backgroundColor: '#f0fdf4', paddingHorizontal: 10, marginHorizontal: -14, paddingLeft: 24, paddingRight: 24 },
  gananciaLabel: { fontSize: 14, fontWeight: '600', color: '#15803d' },
  gananciaContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gananciaValue: { fontSize: 16, fontWeight: '700', color: '#15803d' },
  margenValue: { fontSize: 12, fontWeight: '600', color: '#16a34a' },
  buttonEditarReceta: {
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonEditarRecetaText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  recetaContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  recetaTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#111827' },
  ingredienteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  ingredienteNombre: { flex: 1, fontSize: 13, fontWeight: '500', color: '#111827' },
  ingredienteCantidad: { fontSize: 13, color: '#6b7280', minWidth: 60 },
  ingredienteCosto: { fontSize: 13, fontWeight: '600', color: '#8b5cf6', minWidth: 60, textAlign: 'right' },
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#4b5563',
  },
  ingredientesListContainer: {
    marginBottom: 12,
    maxHeight: 200,
  },
  ingredienteEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  ingredienteEditInfo: { flex: 1 },
  ingredienteEditNombre: { fontSize: 13, fontWeight: '600', color: '#111827' },
  ingredienteEditPrecio: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  ingredienteEditInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    width: 50,
  },
  ingredienteEditUnidad: { fontSize: 12, color: '#6b7280', minWidth: 30 },
  ingredienteDeleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 999,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredienteDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  agregarIngredienteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  agregarIngredienteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
  },
  agregarIngredienteButtonText: { fontSize: 12, color: '#0284c7', fontWeight: '600' },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#e5e7eb',
  },
  modalButtonCancelText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtonSave: {
    backgroundColor: '#10b981',
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default RecetasScreen;
