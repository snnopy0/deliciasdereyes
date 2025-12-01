import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Usuario, Producto, Venta, Pedido, EstadoPedido } from '../types';
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
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  registrarVenta: (productoId: string, cantidad: number) => void;
  registrarVentaMultiple: (ventasItems: VentaItem[]) => void;
  registrarPedido: (cliente: string, productoId: string, cantidad: number) => void;
  registrarPedidoMultiple: (cliente: string, pedidosItems: VentaItem[]) => void;
  actualizarEstadoPedido: (id: string, nuevoEstado: EstadoPedido) => void;
  ajustarStock: (productoId: string, delta: number) => void;
  crearProducto: (nombre: string, stockActual: number, stockMinimo: number, unidad: string, precioVenta: number) => void;
  actualizarPrecioProducto: (productoId: string, nuevoPrecio: number) => void;
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
}

function createInitialState(): PersistedState {
  return {
    productos: INITIAL_PRODUCTS,
    ventas: [],
    pedidos: [],
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = createInitialState();
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [productos, setProductos] = useState<Producto[]>(initial.productos);
  const [ventas, setVentas] = useState<Venta[]>(initial.ventas);
  const [pedidos, setPedidos] = useState<Pedido[]>(initial.pedidos);

  const persist = async (next: PersistedState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Error guardando estado:', e);
    }
  };

  const login = async (username: string, password: string) => {
    const found = USERS.find(
      (u) => u.username === username && u.password === password,
    );
    if (!found) {
      throw new Error('Credenciales inválidas');
    }
    setUsuarioActual(found);
  };

  const logout = () => {
    setUsuarioActual(null);
  };

  const generateId = () =>
    Date.now().toString() + '-' + Math.floor(Math.random() * 1000000).toString();

  const registrarVenta = (productoId: string, cantidadNum: number) => {
    const cantidad = Number(cantidadNum);
    if (!cantidad || cantidad <= 0) {
      return;
    }

    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;

    const nuevoStock = producto.stockActual - cantidad;
    if (nuevoStock < 0) {
      alert('No hay stock suficiente para esta venta.');
      return;
    }

    const fecha = new Date().toISOString().slice(0, 10);

    const nuevaVenta: Venta = {
      id: generateId(),
      fecha,
      productoId,
      cantidad,
      precioUnitario: producto.precioVenta,
    };

    const nextVentas = [...ventas, nuevaVenta];
    const nextProductos = productos.map((p) =>
      p.id === productoId ? { ...p, stockActual: nuevoStock } : p,
    );

    setVentas(nextVentas);
    setProductos(nextProductos);
    persist({ productos: nextProductos, ventas: nextVentas, pedidos });
  };

  const registrarPedido = (cliente: string, productoId: string, cantidadNum: number) => {
    const cantidad = Number(cantidadNum);
    if (!cliente || !productoId || !cantidad || cantidad <= 0) {
      return;
    }

    const fecha = new Date().toISOString().slice(0, 10);

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
    persist({ productos, ventas, pedidos: nextPedidos });
  };

  const actualizarEstadoPedido = (id: string, nuevoEstado: EstadoPedido) => {
    const nextPedidos = pedidos.map((p) =>
      p.id === id ? { ...p, estado: nuevoEstado } : p,
    );
    setPedidos(nextPedidos);
    persist({ productos, ventas, pedidos: nextPedidos });
  };

  const ajustarStock = (productoId: string, delta: number) => {
    const nextProductos = productos.map((p) =>
      p.id === productoId
        ? { ...p, stockActual: Math.max(0, p.stockActual + delta) }
        : p,
    );
    setProductos(nextProductos);
    persist({ productos: nextProductos, ventas, pedidos });
  };

  const registrarVentaMultiple = (ventasItems: VentaItem[]) => {
    let nextProductos = [...productos];
    let nextVentas = [...ventas];
    const fecha = new Date().toISOString().slice(0, 10);

    ventasItems.forEach((item) => {
      const cantidad = Number(item.cantidad);
      if (!cantidad || cantidad <= 0) return;

      const producto = nextProductos.find((p) => p.id === item.id);
      if (!producto) return;

      const nuevoStock = producto.stockActual - cantidad;
      if (nuevoStock < 0) {
        alert(`No hay stock suficiente para ${producto.nombre}`);
        return;
      }

      const nuevaVenta: Venta = {
        id: generateId(),
        fecha,
        productoId: item.id,
        cantidad,
        precioUnitario: producto.precioVenta,
      };

      nextVentas = [...nextVentas, nuevaVenta];
      nextProductos = nextProductos.map((p) =>
        p.id === item.id ? { ...p, stockActual: nuevoStock } : p,
      );
    });

    setVentas(nextVentas);
    setProductos(nextProductos);
    persist({ productos: nextProductos, ventas: nextVentas, pedidos });
  };

  const crearProducto = (nombre: string, stockActual: number, stockMinimo: number, unidad: string, precioVenta: number) => {
    if (!nombre || stockActual < 0 || stockMinimo < 0 || !unidad || precioVenta < 0) {
      alert('Por favor completa todos los campos correctamente');
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
    persist({ productos: nextProductos, ventas, pedidos });
  };

  const registrarPedidoMultiple = (cliente: string, pedidosItems: VentaItem[]) => {
    if (!cliente || pedidosItems.length === 0) {
      alert('Por favor ingresa el cliente y selecciona productos');
      return;
    }

    const fecha = new Date().toISOString().slice(0, 10);
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
    persist({ productos, ventas, pedidos: nextPedidos });
  };

  const actualizarPrecioProducto = (productoId: string, nuevoPrecio: number) => {
    if (nuevoPrecio < 0) {
      alert('El precio no puede ser negativo');
      return;
    }

    const nextProductos = productos.map((p) =>
      p.id === productoId ? { ...p, precioVenta: nuevoPrecio } : p,
    );

    setProductos(nextProductos);
    persist({ productos: nextProductos, ventas, pedidos });
  };

  const value: AppContextType = {
    usuarioActual,
    productos,
    ventas,
    pedidos,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return ctx;
};
