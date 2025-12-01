import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { RecetaProducto } from '../types';

const InventarioScreen: React.FC = () => {
  const navigation = useNavigation();
  const { productos, ajustarStock, crearProducto, actualizarPrecioProducto, logout, calcularMaxProducible, producirProducto, setProductoRecetaEditar, eliminarProducto } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [precioModalVisible, setPrecioModalVisible] = useState(false);
  const [editPrecioModalVisible, setEditPrecioModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [stockActual, setStockActual] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');
  const [unidad, setUnidad] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [editStockId, setEditStockId] = useState<string | null>(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [editPrecioId, setEditPrecioId] = useState<string | null>(null);
  const [editPrecioValor, setEditPrecioValor] = useState('');
  const [productoPrecioEditar, setProductoPrecioEditar] = useState<{ id: string; nombre: string; precio: number } | null>(null);
  const [produceModalVisible, setProduceModalVisible] = useState(false);
  const [produceCantidad, setProduceCantidad] = useState('');
  const [productoAProducir, setProductoAProducir] = useState<string | null>(null);

  const porAcabarse = productos.filter(
    (p) => p.stockActual <= p.stockMinimo,
  );

  const handleCrearProducto = () => {
    if (!nombre || !stockActual || !stockMinimo || !unidad) {
      alert('Por favor completa todos los campos del producto');
      return;
    }
    setModalVisible(false);
    setPrecioModalVisible(true);
  };

  const handleGuardarProducto = () => {
    if (!precioVenta) {
      alert('Por favor ingresa el precio de venta');
      return;
    }
    crearProducto(
      nombre,
      Number(stockActual),
      Number(stockMinimo),
      unidad,
      Number(precioVenta)
    );
    setPrecioModalVisible(false);
    setNombre('');
    setStockActual('');
    setStockMinimo('');
    setUnidad('');
    setPrecioVenta('');
    alert('Producto creado exitosamente');
  };

  const handleActualizarStock = () => {
    if (!editStockId || !nuevoStock) return;
    
    // Validar que sea un número válido
    const stockNum = Number(nuevoStock);
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Por favor ingresa un número válido');
      return;
    }
    
    const diferencia = stockNum - (productos.find((p) => p.id === editStockId)?.stockActual || 0);
    ajustarStock(editStockId, diferencia);
    setEditStockId(null);
    setNuevoStock('');
    alert('Stock actualizado');
  };

  const handleActualizarPrecio = () => {
    if (!editPrecioId || !editPrecioValor) return;
    
    // Validar que sea un número válido
    const precioNum = Number(editPrecioValor);
    if (isNaN(precioNum) || precioNum < 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }
    
    actualizarPrecioProducto(editPrecioId, precioNum);
    setEditPrecioModalVisible(false);
    setEditPrecioId(null);
    setEditPrecioValor('');
    setProductoPrecioEditar(null);
    alert('Precio actualizado');
  };

  const abrirModalEditarPrecio = (id: string, nombre: string, precio: number) => {
    setProductoPrecioEditar({ id, nombre, precio });
    setEditPrecioId(id);
    setEditPrecioValor(precio.toString());
    setEditPrecioModalVisible(true);
  };

  const confirmarEliminarProducto = (productoId: string, productoNombre: string) => {
    const confirmacion = confirm(
      `¿Estás seguro de que deseas eliminar "${productoNombre}"? Esta acción no se puede deshacer.`
    );
    if (confirmacion) {
      eliminarProducto(productoId);
      alert('Producto eliminado exitosamente');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Inventario</Text>

      <TouchableOpacity
        style={styles.buttonNuevoProducto}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonNuevoProductoText}>+ Nuevo Producto</Text>
      </TouchableOpacity>

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
          const isEditing = editStockId === p.id;
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
                  Mínimo: {p.stockMinimo} {p.unidad}
                </Text>
                <TouchableOpacity
                  onPress={() => abrirModalEditarPrecio(p.id, p.nombre, p.precioVenta)}
                  style={styles.editPrecioButton}
                >
                  <Text style={styles.editPrecioButtonText}>Precio: ${p.precioVenta.toFixed(2)}</Text>
                </TouchableOpacity>

                <View style={styles.buttonsRow}>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginRight: 8 }}>
                    Producible: {Math.max(0, calcularMaxProducible(p.id))}
                  </Text>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => {
                      setProductoRecetaEditar(p.id);
                      (navigation as any).navigate('Recetas');
                    }}
                  >
                    <Text style={styles.smallButtonText}>Receta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => {
                      setProductoAProducir(p.id);
                      setProduceCantidad('1');
                      setProduceModalVisible(true);
                    }}
                  >
                    <Text style={styles.smallButtonText}>Producir</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    keyboardType="number-pad"
                    value={nuevoStock}
                    onChangeText={(text) => {
                      // Solo acepta números
                      if (text === '' || /^\d+$/.test(text)) {
                        setNuevoStock(text);
                      }
                    }}
                    placeholder={p.stockActual.toString()}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.editButtonConfirm}
                    onPress={handleActualizarStock}
                  >
                    <Text style={styles.editButtonText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editButtonCancel}
                    onPress={() => {
                      setEditStockId(null);
                      setNuevoStock('');
                    }}
                  >
                    <Text style={styles.editButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.stockContainer}
                  onPress={() => {
                    setEditStockId(p.id);
                    setNuevoStock(p.stockActual.toString());
                  }}
                >
                  <Text style={styles.stockText}>{p.stockActual}</Text>
                  <Text style={styles.stockLabel}>{p.unidad}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmarEliminarProducto(p.id, p.nombre)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>✕ Eliminar</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para crear nuevo producto */}
      <Modal
        visible={modalVisible === true}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Nuevo Producto</Text>

            <Text style={styles.modalLabel}>Nombre del producto</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Pan blanco"
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.modalLabel}>Stock inicial</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: 50"
              keyboardType="number-pad"
              value={stockActual}
              onChangeText={(text) => {
                // Solo acepta números
                if (text === '' || /^\d+$/.test(text)) {
                  setStockActual(text);
                }
              }}
            />

            <Text style={styles.modalLabel}>Stock mínimo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: 10"
              keyboardType="number-pad"
              value={stockMinimo}
              onChangeText={(text) => {
                // Solo acepta números
                if (text === '' || /^\d+$/.test(text)) {
                  setStockMinimo(text);
                }
              }}
            />

            <Text style={styles.modalLabel}>Unidad</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: kg, unidades, docenas"
              value={unidad}
              onChangeText={setUnidad}
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonContinue]}
                onPress={handleCrearProducto}
              >
                <Text style={styles.modalButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para producir unidades desde ingredientes */}
      <Modal
        visible={produceModalVisible === true}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProduceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Producir unidades</Text>

            <Text style={styles.modalLabel}>Cantidad a producir</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: 10"
              keyboardType="number-pad"
              value={produceCantidad}
              onChangeText={(text) => {
                if (text === '' || /^\d+$/.test(text)) setProduceCantidad(text);
              }}
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setProduceModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={() => {
                  if (!productoAProducir) return;
                  const qty = Number(produceCantidad);
                  if (!qty || qty <= 0) { alert('Cantidad inválida'); return; }
                  const ok = producirProducto(productoAProducir, qty);
                  if (ok) {
                    setProduceModalVisible(false);
                    setProductoAProducir(null);
                    setProduceCantidad('');
                    alert('Producción realizada');
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Producir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para agregar precio */}
      <Modal
        visible={precioModalVisible === true}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPrecioModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Precio de Venta</Text>

            <View style={styles.precioInfoContainer}>
              <Text style={styles.precioInfoLabel}>Producto:</Text>
              <Text style={styles.precioInfoValue}>{nombre}</Text>
            </View>

            <Text style={styles.modalLabel}>Precio de venta</Text>
            <View style={styles.precioInputContainer}>
              <Text style={styles.precioCurrencySymbol}>$</Text>
              <TextInput
                style={styles.precioInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={precioVenta}
                onChangeText={setPrecioVenta}
              />
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setPrecioModalVisible(false);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Atrás</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleGuardarProducto}
              >
                <Text style={styles.modalButtonText}>Guardar Producto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para editar precio */}
      <Modal
        visible={editPrecioModalVisible === true}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditPrecioModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Precio</Text>

            <View style={styles.precioInfoContainer}>
              <Text style={styles.precioInfoLabel}>Producto:</Text>
              <Text style={styles.precioInfoValue}>{productoPrecioEditar?.nombre}</Text>
            </View>

            <Text style={styles.modalLabel}>Nuevo precio de venta</Text>
            <View style={styles.precioInputContainer}>
              <Text style={styles.precioCurrencySymbol}>$</Text>
              <TextInput
                style={styles.precioInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={editPrecioValor}
                onChangeText={(text) => {
                  // Solo acepta números y un punto decimal
                  if (text === '' || /^\d*\.?\d*$/.test(text)) {
                    setEditPrecioValor(text);
                  }
                }}
                autoFocus
              />
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setEditPrecioModalVisible(false);
                  setEditPrecioId(null);
                  setEditPrecioValor('');
                  setProductoPrecioEditar(null);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleActualizarPrecio}
              >
                <Text style={styles.modalButtonText}>Guardar Precio</Text>
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
  buttonNuevoProducto: {
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonNuevoProductoText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
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
    minHeight: 40,
    minWidth: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButtonText: { fontSize: 13, fontWeight: '600', color: '#111827' },
  smallButtonDelete: { backgroundColor: '#ef4444' },
  smallButtonDeleteText: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  stockContainer: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  stockText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  stockLabel: {
    fontSize: 11,
    color: '#e9d5ff',
    marginTop: 2,
  },
  editContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#8b5cf6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    width: 50,
  },
  editButtonConfirm: {
    backgroundColor: '#10b981',
    borderRadius: 999,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonCancel: {
    backgroundColor: '#ef4444',
    borderRadius: 999,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  editPrecioButton: {
    marginTop: 6,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editPrecioButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 6,
    color: '#4b5563',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    fontSize: 14,
    color: '#111827',
  },
  precioInfoContainer: {
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  precioInfoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  precioInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  precioInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
  },
  precioCurrencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8b5cf6',
    marginRight: 4,
  },
  precioInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
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
  modalButtonContinue: {
    backgroundColor: '#8b5cf6',
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

export default InventarioScreen;
