import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Usuario, Producto, Venta, Pedido, EstadoPedido } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

interface AppContextType {
  usuarioActual: Usuario | null;
  productos: Producto[];
  ventas: Venta[];
  pedidos: Pedido[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  registrarVenta: (productoId: string, cantidad: number) => void;
  registrarPedido: (cliente: string, productoId: string, cantidad: number) => void;
  actualizarEstadoPedido: (id: string, nuevoEstado: EstadoPedido) => void;
  ajustarStock: (productoId: string, delta: number) => void;
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

  const value: AppContextType = {
    usuarioActual,
    productos,
    ventas,
    pedidos,
    login,
    logout,
    registrarVenta,
    registrarPedido,
    actualizarEstadoPedido,
    ajustarStock,
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
