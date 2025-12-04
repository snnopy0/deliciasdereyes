import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Usuario,
  Producto,
  Venta,
  Pedido,
  EstadoPedido,
  Ingrediente,
  RecetaProducto,
  TipoUnidadIngrediente,
} from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

interface VentaItem {
  id: string;
  cantidad: string;
}

interface AppContextType {
  usuarioActual: Usuario | null;
  productos: Producto[];
  ventas: Venta[];
  pedidos: Pedido[];
  ingredientes: Ingrediente[];
  recetas: RecetaProducto[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  registrarVenta: (productoId: string, cantidad: number) => void;
  registrarVentaMultiple: (ventasItems: VentaItem[]) => void;
  registrarPedido: (cliente: string, productoId: string, cantidad: number) => void;
  registrarPedidoMultiple: (cliente: string, pedidosItems: VentaItem[]) => void;
  actualizarEstadoPedido: (id: string, nuevoEstado: EstadoPedido) => void;
  ajustarStock: (productoId: string, delta: number) => void;
  crearProducto: (
    nombre: string,
    stockActual: number,
    stockMinimo: number,
    unidad: string,
    precioVenta: number,
  ) => void;
  actualizarPrecioProducto: (productoId: string, nuevoPrecio: number) => void;
  crearIngrediente: (
    nombre: string,
    tipoUnidad: TipoUnidadIngrediente,
    stockActual: number,
    precioUnitario: number,
  ) => void;
  ajustarStockIngrediente: (ingredienteId: string, delta: number) => void;
  actualizarPrecioIngrediente: (ingredienteId: string, nuevoPrecio: number) => void;
  guardarRecetaProducto: (
    productoId: string,
    ingredientes: { ingredienteId: string; cantidad: number }[],
  ) => void;
  obtenerRecetaProducto: (productoId: string) => RecetaProducto | undefined;
  calcularCostoProduccion: (productoId: string, cantidad: number) => number;
  calcularMaxProducible: (productoId: string) => number;
  producirProducto: (productoId: string, cantidad: number) => boolean;
  productoRecetaEditar: string | null;
  setProductoRecetaEditar: (id: string | null) => void;
  eliminarProducto: (productoId: string) => void;
  eliminarIngrediente: (ingredienteId: string) => void;
  eliminarPedido: (pedidoId: string | string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USERS: Usuario[] = [
  { username: 'ventas', password: '1234', rol: 'VENTAS' },
  { username: 'produccion', password: '1234', rol: 'PRODUCCION' },
];

const STORAGE_KEY = 'panaderia-app-state-v1';

interface PersistedState {
  productos: Producto[];
  ventas: Venta[];
  pedidos: Pedido[];
  ingredientes: Ingrediente[];
  recetas: RecetaProducto[];
}

function createInitialState(): PersistedState {
  return {
    productos: INITIAL_PRODUCTS,
    ventas: [],
    pedidos: [],
    ingredientes: [],
    recetas: [],
  };
}

// Fecha normalizada YYYY-MM-DD (sin horas)
const getTodayDateString = (): string => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = createInitialState();
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [productos, setProductos] = useState<Producto[]>(initial.productos);
  const [ventas, setVentas] = useState<Venta[]>(initial.ventas);
  const [pedidos, setPedidos] = useState<Pedido[]>(initial.pedidos);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>(initial.ingredientes);
  const [recetas, setRecetas] = useState<RecetaProducto[]>(initial.recetas);
  const [productoRecetaEditar, setProductoRecetaEditar] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: PersistedState = JSON.parse(raw);
          setProductos(parsed.productos || initial.productos);
          setVentas(parsed.ventas || []);
          setPedidos(parsed.pedidos || []);
          setIngredientes(parsed.ingredientes || []);
          setRecetas(parsed.recetas || []);
        }
      } catch (e) {
        console.warn('Error cargando estado:', e);
      }
    })();
  }, []);

  const persist = async (next: PersistedState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Error guardando estado:', e);
    }
  };

  const login = async (username: string, password: string) => {
    const found = USERS.find((u) => u.username === username && u.password === password);
    if (!found) throw new Error('Credenciales inválidas');
    setUsuarioActual(found);
  };

  const logout = () => setUsuarioActual(null);

  const generateId = () =>
    Date.now().toString() + '-' + Math.floor(Math.random() * 1000000).toString();

  const ajustarStock = (productoId: string, delta: number) => {
    const nextProductos = productos.map((p) =>
      p.id === productoId
        ? { ...p, stockActual: Math.max(0, p.stockActual + delta) }
        : p,
    );
    setProductos(nextProductos);
    persist({ productos: nextProductos, ventas, pedidos, ingredientes, recetas });
  };

  const crearProducto = (
    nombre: string,
    stockActual: number,
    stockMinimo: number,
    unidad: string,
    precioVenta: number,
  ) => {
    if (!nombre || stockActual < 0 || stockMinimo < 0 || !unidad || precioVenta < 0) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }
    const nuevoProducto: Producto = {
      id: generateId(),
      nombre,
      stockActual,
      stockMinimo,
      unidad,
      precioVenta,
    };
    const nextProductos = [...productos, nuevoProducto];
    setProductos(nextProductos);
    persist({ productos: nextProductos, ventas, pedidos, ingredientes, recetas });
  };

  const actualizarPrecioProducto = (productoId: string, nuevoPrecio: number) => {
    if (nuevoPrecio < 0) {
      Alert.alert('Error', 'El precio no puede ser negativo');
      return;
    }
    const nextProductos = productos.map((p) =>
      p.id === productoId ? { ...p, precioVenta: nuevoPrecio } : p,
    );
    setProductos(nextProductos);
    persist({ productos: nextProductos, ventas, pedidos, ingredientes, recetas });
  };

  const eliminarProducto = (productoId: string) => {
    const nextProductos = productos.filter((p) => p.id !== productoId);
    const nextRecetas = recetas.filter((r) => r.productoId !== productoId);
    setProductos(nextProductos);
    setRecetas(nextRecetas);
    persist({
      productos: nextProductos,
      ventas,
      pedidos,
      ingredientes,
      recetas: nextRecetas,
    });
  };

  // Ingredientes
  const crearIngrediente = (
    nombre: string,
    tipoUnidad: TipoUnidadIngrediente,
    stockActual: number,
    precioUnitario: number,
  ) => {
    if (!nombre || stockActual < 0 || precioUnitario < 0) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }
    const stockMinimo = tipoUnidad === 'kg' ? 5 : tipoUnidad === 'litros' ? 10 : 15;
    const nuevoIngrediente: Ingrediente = {
      id: generateId(),
      nombre,
      tipoUnidad,
      stockActual,
      stockMinimo,
      precioUnitario,
    };
    const nextIngredientes = [...ingredientes, nuevoIngrediente];
    setIngredientes(nextIngredientes);
    persist({ productos, ventas, pedidos, ingredientes: nextIngredientes, recetas });
  };

  const ajustarStockIngrediente = (ingredienteId: string, delta: number) => {
    const nextIngredientes = ingredientes.map((i) =>
      i.id === ingredienteId
        ? { ...i, stockActual: Math.max(0, i.stockActual + delta) }
        : i,
    );
    setIngredientes(nextIngredientes);
    persist({ productos, ventas, pedidos, ingredientes: nextIngredientes, recetas });
  };

  const actualizarPrecioIngrediente = (
    ingredienteId: string,
    nuevoPrecio: number,
  ) => {
    if (nuevoPrecio < 0) {
      Alert.alert('Error', 'El precio no puede ser negativo');
      return;
    }
    const nextIngredientes = ingredientes.map((i) =>
      i.id === ingredienteId ? { ...i, precioUnitario: nuevoPrecio } : i,
    );
    setIngredientes(nextIngredientes);
    persist({ productos, ventas, pedidos, ingredientes: nextIngredientes, recetas });
  };

  const eliminarIngrediente = (ingredienteId: string) => {
    const nextIngredientes = ingredientes.filter((i) => i.id !== ingredienteId);
    const nextRecetas = recetas.map((r) => ({
      ...r,
      ingredientes: r.ingredientes.filter(
        (ing) => ing.ingredienteId !== ingredienteId,
      ),
    }));
    setIngredientes(nextIngredientes);
    setRecetas(nextRecetas);
    persist({
      productos,
      ventas,
      pedidos,
      ingredientes: nextIngredientes,
      recetas: nextRecetas,
    });
  };

  // Recetas
  const guardarRecetaProducto = (
    productoId: string,
    ingredientesReceta: { ingredienteId: string; cantidad: number }[],
  ) => {
    const idx = recetas.findIndex((r) => r.productoId === productoId);
    let nextRecetas = [...recetas];
    if (idx >= 0) nextRecetas[idx] = { productoId, ingredientes: ingredientesReceta };
    else nextRecetas = [...recetas, { productoId, ingredientes: ingredientesReceta }];
    setRecetas(nextRecetas);
    persist({ productos, ventas, pedidos, ingredientes, recetas: nextRecetas });
  };

  const obtenerRecetaProducto = (productoId: string) =>
    recetas.find((r) => r.productoId === productoId);

  const calcularCostoProduccion = (productoId: string, cantidad: number) => {
    const receta = obtenerRecetaProducto(productoId);
    if (!receta) return 0;
    let costoTotal = 0;
    receta.ingredientes.forEach((item) => {
      const ing = ingredientes.find((i) => i.id === item.ingredienteId);
      if (ing) costoTotal += ing.precioUnitario * item.cantidad * cantidad;
    });
    return costoTotal;
  };

  const calcularMaxProducible = (productoId: string) => {
    const receta = obtenerRecetaProducto(productoId);
    if (!receta) return 0;

    const posibles = receta.ingredientes.map((item) => {
      const ing = ingredientes.find((i) => i.id === item.ingredienteId);
      if (!ing) return 0;
      if (item.cantidad <= 0) return 0;
      return Math.floor(ing.stockActual / item.cantidad);
    });

    if (posibles.length === 0) return 0;
    return Math.max(0, Math.min(...posibles));
  };

  const producirProducto = (productoId: string, cantidad: number) => {
    const receta = obtenerRecetaProducto(productoId);
    if (!receta) {
      Alert.alert('Error', 'No existe receta para este producto');
      return false;
    }

    const max = calcularMaxProducible(productoId);
    if (cantidad <= 0 || cantidad > max) {
      Alert.alert(
        'Error',
        `No se puede producir ${cantidad} unidades. Máximo producible: ${max}`,
      );
      return false;
    }

    const nextIngredientes = ingredientes.map((ing) => {
      const req = receta.ingredientes.find((r) => r.ingredienteId === ing.id);
      if (!req) return ing;
      return {
        ...ing,
        stockActual: Math.max(0, ing.stockActual - req.cantidad * cantidad),
      };
    });

    const nextProductos = productos.map((p) =>
      p.id === productoId ? { ...p, stockActual: p.stockActual + cantidad } : p,
    );

    setIngredientes(nextIngredientes);
    setProductos(nextProductos);
    persist({
      productos: nextProductos,
      ventas,
      pedidos,
      ingredientes: nextIngredientes,
      recetas,
    });
    return true;
  };

  // Ventas / Pedidos
  const registrarVenta = (productoId: string, cantidadNum: number) => {
    const cantidad = Number(cantidadNum);
    if (!cantidad || cantidad <= 0) return;
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;
    const nuevoStock = producto.stockActual - cantidad;
    if (nuevoStock < 0) {
      Alert.alert('Error', 'No hay stock suficiente para esta venta.');
      return;
    }
    const fecha = getTodayDateString();
    const costoProduccion = calcularCostoProduccion(productoId, cantidad);
    const gananciaPorUnidad =
      producto.precioVenta -
      (cantidad > 0 ? costoProduccion / cantidad : 0);
    const nuevaVenta: Venta = {
      id: generateId(),
      fecha,
      productoId,
      cantidad,
      precioUnitario: producto.precioVenta,
      costoProduccion,
      ganancia: gananciaPorUnidad * cantidad,
    };
    const nextVentas = [...ventas, nuevaVenta];
    const nextProductos = productos.map((p) =>
      p.id === productoId ? { ...p, stockActual: nuevoStock } : p,
    );
    setVentas(nextVentas);
    setProductos(nextProductos);
    persist({
      productos: nextProductos,
      ventas: nextVentas,
      pedidos,
      ingredientes,
      recetas,
    });
  };

  const registrarVentaMultiple = (ventasItems: VentaItem[]) => {
    let nextProductos = [...productos];
    let nextVentas = [...ventas];
    const fecha = getTodayDateString();

    ventasItems.forEach((item) => {
      const cantidad = Number(item.cantidad);
      if (!cantidad || cantidad <= 0) return;
      const producto = nextProductos.find((p) => p.id === item.id);
      if (!producto) return;
      const nuevoStock = producto.stockActual - cantidad;
      if (nuevoStock < 0) {
        Alert.alert('Error', `No hay stock suficiente para ${producto.nombre}`);
        return;
      }

      const costoProduccion = calcularCostoProduccion(item.id, cantidad);
      const gananciaPorUnidad =
        producto.precioVenta -
        (cantidad > 0 ? costoProduccion / cantidad : 0);

      const nuevaVenta: Venta = {
        id: generateId(),
        fecha,
        productoId: item.id,
        cantidad,
        precioUnitario: producto.precioVenta,
        costoProduccion,
        ganancia: gananciaPorUnidad * cantidad,
      };

      nextVentas = [...nextVentas, nuevaVenta];
      nextProductos = nextProductos.map((p) =>
        p.id === item.id ? { ...p, stockActual: nuevoStock } : p,
      );
    });

    setVentas(nextVentas);
    setProductos(nextProductos);
    persist({
      productos: nextProductos,
      ventas: nextVentas,
      pedidos,
      ingredientes,
      recetas,
    });
  };

  const registrarPedido = (
    cliente: string,
    productoId: string,
    cantidadNum: number,
  ) => {
    const cantidad = Number(cantidadNum);
    if (!cliente || !productoId || !cantidad || cantidad <= 0) return;
    const fecha = getTodayDateString();
    const nuevoPedido: Pedido = {
      id: generateId(),
      cliente,
      fecha,
      estado: 'pendiente',
      productoId,
      cantidad,
    };
    const nextPedidos = [...pedidos, nuevoPedido];
    setPedidos(nextPedidos);
    persist({ productos, ventas, pedidos: nextPedidos, ingredientes, recetas });
  };

  const registrarPedidoMultiple = (
    cliente: string,
    pedidosItems: VentaItem[],
  ) => {
    const fecha = getTodayDateString();
    let nextPedidos = [...pedidos];

    pedidosItems.forEach((item) => {
      const cantidad = Number(item.cantidad);
      if (!cantidad || cantidad <= 0) return;
      const producto = productos.find((p) => p.id === item.id);
      if (!producto) return;

      const nuevoPedido: Pedido = {
        id: generateId(),
        cliente,
        fecha,
        estado: 'pendiente',
        productoId: item.id,
        cantidad,
      };

      nextPedidos = [...nextPedidos, nuevoPedido];
    });

    setPedidos(nextPedidos);
    persist({ productos, ventas, pedidos: nextPedidos, ingredientes, recetas });
  };

  const actualizarEstadoPedido = (id: string, nuevoEstado: EstadoPedido) => {
    const nextPedidos = pedidos.map((p) =>
      p.id === id ? { ...p, estado: nuevoEstado } : p,
    );
    setPedidos(nextPedidos);
    persist({ productos, ventas, pedidos: nextPedidos, ingredientes, recetas });
  };

  const eliminarPedido = (pedidoId: string | string[]) => {
    const ids = Array.isArray(pedidoId) ? pedidoId : [pedidoId];
    const nextPedidos = pedidos.filter((p) => !ids.includes(p.id));
    setPedidos(nextPedidos);
    persist({ productos, ventas, pedidos: nextPedidos, ingredientes, recetas });
  };

  const value: AppContextType = {
    usuarioActual,
    productos,
    ventas,
    pedidos,
    ingredientes,
    recetas,
    login,
    logout,
    registrarVenta,
    registrarVentaMultiple,
    registrarPedido,
    registrarPedidoMultiple,
    actualizarEstadoPedido,
    ajustarStock,
    crearProducto,
    actualizarPrecioProducto,
    crearIngrediente,
    ajustarStockIngrediente,
    actualizarPrecioIngrediente,
    guardarRecetaProducto,
    obtenerRecetaProducto,
    calcularCostoProduccion,
    calcularMaxProducible,
    producirProducto,
    productoRecetaEditar,
    setProductoRecetaEditar,
    eliminarProducto,
    eliminarIngrediente,
    eliminarPedido,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext debe usarse dentro de AppProvider');
  return ctx;
};
