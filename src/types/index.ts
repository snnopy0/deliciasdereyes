export type RolUsuario = 'VENTAS' | 'PRODUCCION';

export type TipoUnidadIngrediente = 'kg' | 'litros' | 'unitarios';

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

export interface Ingrediente {
  id: string;
  nombre: string;
  tipoUnidad: TipoUnidadIngrediente;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
}

export interface RecetaProducto {
  productoId: string;
  ingredientes: {
    ingredienteId: string;
    cantidad: number;
  }[];
}

export interface Venta {
  id: string;
  fecha: string; // yyyy-mm-dd
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  costoProduccion?: number;
  ganancia?: number;
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
