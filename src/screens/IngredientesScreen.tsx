import React, { useState } from 'react';
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
import type { TipoUnidadIngrediente } from '../types';

const IngredientesScreen: React.FC = () => {
  const { ingredientes, crearIngrediente, ajustarStockIngrediente, actualizarPrecioIngrediente, logout } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tipoUnidad, setTipoUnidad] = useState<TipoUnidadIngrediente>('kg');
  const [stockActual, setStockActual] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [editStockId, setEditStockId] = useState<string | null>(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [editPrecioId, setEditPrecioId] = useState<string | null>(null);
  const [editPrecioValor, setEditPrecioValor] = useState('');
  const [ingredientePrecioEditar, setIngredientePrecioEditar] = useState<{ id: string; nombre: string; precio: number } | null>(null);

  const porAcabarse = ingredientes.filter((i) => i.stockActual <= i.stockMinimo);

  const handleCrearIngrediente = () => {
    if (!nombre || !stockActual || !precioUnitario) {
      alert('Por favor completa todos los campos');
      return;
    }
    crearIngrediente(nombre, tipoUnidad, Number(stockActual), Number(precioUnitario));
    setModalVisible(false);
    setNombre('');
    setStockActual('');
    setPrecioUnitario('');
    setTipoUnidad('kg');
    alert('Ingrediente creado exitosamente');
  };

  const handleActualizarStock = () => {
    if (!editStockId || !nuevoStock) return;
    const diferencia = Number(nuevoStock) - (ingredientes.find((i) => i.id === editStockId)?.stockActual || 0);
    ajustarStockIngrediente(editStockId, diferencia);
    setEditStockId(null);
    setNuevoStock('');
    alert('Stock actualizado');
  };

  const handleActualizarPrecio = () => {
    if (!editPrecioId || !editPrecioValor) return;
    const precioNum = Number(editPrecioValor);
    if (isNaN(precioNum) || precioNum < 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }
    actualizarPrecioIngrediente(editPrecioId, precioNum);
    setEditPrecioId(null);
    setEditPrecioValor('');
    setIngredientePrecioEditar(null);
    alert('Precio actualizado');
  };

  const abrirModalEditarPrecio = (id: string, nombre: string, precio: number) => {
    setIngredientePrecioEditar({ id, nombre, precio });
    setEditPrecioId(id);
    setEditPrecioValor(precio.toString());
  };

  const getUnidadLabel = (tipo: TipoUnidadIngrediente): string => {
    switch (tipo) {
      case 'kg':
        return 'kg';
      case 'litros':
        return 'L';
      case 'unitarios':
        return 'und.';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ingredientes</Text>

      <TouchableOpacity
        style={styles.buttonNuevoIngrediente}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonNuevoIngredienteText}>+ Nuevo Ingrediente</Text>
      </TouchableOpacity>

      <View style={styles.cardHighlight}>
        <Text style={styles.sectionTitle}>Inventario bajo</Text>
        {porAcabarse.length === 0 ? (
          <Text style={styles.empty}>Todo bien surtido.</Text>
        ) : (
          porAcabarse.map((i) => (
            <View key={i.id} style={styles.highlightRow}>
              <Text style={styles.highlightName}>{i.nombre}</Text>
              <Text style={styles.highlightText}>
                Stock: {i.stockActual} {getUnidadLabel(i.tipoUnidad)} (mínimo {i.stockMinimo})
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Todos los ingredientes</Text>
        {ingredientes.map((i) => {
          const critical = i.stockActual <= i.stockMinimo;
          const isEditing = editStockId === i.id;
          return (
            <View
              key={i.id}
              style={[
                styles.row,
                critical && styles.rowCritical,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{i.nombre}</Text>
                <Text style={styles.rowText}>
                  Mínimo: {i.stockMinimo} {getUnidadLabel(i.tipoUnidad)}
                </Text>
                <TouchableOpacity
                  onPress={() => abrirModalEditarPrecio(i.id, i.nombre, i.precioUnitario)}
                  style={styles.editPrecioButton}
                >
                  <Text style={styles.editPrecioButtonText}>Precio: ${i.precioUnitario.toFixed(2)}</Text>
                </TouchableOpacity>
              </View>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    keyboardType="number-pad"
                    value={nuevoStock}
                    onChangeText={(text) => {
                      // Solo números enteros positivos y decimales
                      if (text === '' || /^\d*\.?\d*$/.test(text)) {
                        setNuevoStock(text);
                      }
                    }}
                    placeholder={i.stockActual.toString()}
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
                    setEditStockId(i.id);
                    setNuevoStock(i.stockActual.toString());
                  }}
                >
                  <Text style={styles.stockText}>{i.stockActual}</Text>
                  <Text style={styles.stockLabel}>{getUnidadLabel(i.tipoUnidad)}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para crear nuevo ingrediente */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Nuevo Ingrediente</Text>

            <Text style={styles.modalLabel}>Nombre del ingrediente</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Harina"
              value={nombre}
              onChangeText={(text) => {
                // Solo permite letras, números y espacios
                if (text === '' || /^[a-zA-Z0-9\s]*$/.test(text)) {
                  setNombre(text);
                }
              }}
            />

            <Text style={styles.modalLabel}>Tipo de unidad</Text>
            <View style={styles.unidadButtonsContainer}>
              {(['kg', 'litros', 'unitarios'] as TipoUnidadIngrediente[]).map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.unidadButton,
                    tipoUnidad === tipo && styles.unidadButtonSelected,
                  ]}
                  onPress={() => setTipoUnidad(tipo)}
                >
                  <Text
                    style={[
                      styles.unidadButtonText,
                      tipoUnidad === tipo && styles.unidadButtonTextSelected,
                    ]}
                  >
                    {tipo === 'unitarios' ? 'Unitarios' : tipo === 'kg' ? 'Kilos' : 'Litros'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Stock inicial</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: 50"
              keyboardType="number-pad"
              value={stockActual}
              onChangeText={(text) => {
                // Solo números enteros positivos y decimales
                if (text === '' || /^\d*\.?\d*$/.test(text)) {
                  setStockActual(text);
                }
              }}
            />

            <Text style={styles.modalLabel}>Precio unitario</Text>
            <View style={styles.precioInputContainer}>
              <Text style={styles.precioCurrencySymbol}>$</Text>
              <TextInput
                style={styles.precioInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={precioUnitario}
                onChangeText={(text) => {
                  // Solo números y punto decimal
                  if (text === '' || /^\d*\.?\d*$/.test(text)) {
                    setPrecioUnitario(text);
                  }
                }}
              />
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
                onPress={handleCrearIngrediente}
              >
                <Text style={styles.modalButtonText}>Guardar Ingrediente</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para editar precio */}
      <Modal
        visible={editPrecioId !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditPrecioId(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Precio</Text>

            <View style={styles.precioInfoContainer}>
              <Text style={styles.precioInfoLabel}>Ingrediente:</Text>
              <Text style={styles.precioInfoValue}>{ingredientePrecioEditar?.nombre}</Text>
            </View>

            <Text style={styles.modalLabel}>Nuevo precio unitario</Text>
            <View style={styles.precioInputContainer}>
              <Text style={styles.precioCurrencySymbol}>$</Text>
              <TextInput
                style={styles.precioInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={editPrecioValor}
                onChangeText={(text) => {
                  // Solo números y punto decimal
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
                  setEditPrecioId(null);
                  setEditPrecioValor('');
                  setIngredientePrecioEditar(null);
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
  buttonNuevoIngrediente: {
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonNuevoIngredienteText: {
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
  unidadButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  unidadButton: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  unidadButtonSelected: {
    backgroundColor: '#8b5cf6',
  },
  unidadButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  unidadButtonTextSelected: {
    color: '#ffffff',
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
  modalButtonSave: {
    backgroundColor: '#10b981',
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default IngredientesScreen;
