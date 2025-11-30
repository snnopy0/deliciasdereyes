export type RolUsuario = 'VENTAS' | 'PRODUCCION';

export interface Usuario {
  username: string;
  password: string;
  rol: RolUsuario;
}

export interface Producto {
  id: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
  precioVenta: number;
}

export interface Venta {
  id: string;
  fecha: string; // yyyy-mm-dd
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export type EstadoPedido = 'pendiente' | 'entregado';

export interface Pedido {
  id: string;
  cliente: string;
  fecha: string;
  estado: EstadoPedido;
  productoId: string;
  cantidad: number;
}
