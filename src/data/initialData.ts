import type { Producto } from '../types';

export const INITIAL_PRODUCTS: Producto[] = [
  { id: '1', nombre: 'Pan blanco', stockActual: 30, stockMinimo: 10, unidad: 'unidades', precioVenta: 500 },
  { id: '2', nombre: 'Pan integral', stockActual: 20, stockMinimo: 8, unidad: 'unidades', precioVenta: 600 },
  { id: '3', nombre: 'Torta de chocolate', stockActual: 5, stockMinimo: 2, unidad: 'unidades', precioVenta: 12000 },
  { id: '4', nombre: 'Pastel tres leches', stockActual: 4, stockMinimo: 2, unidad: 'unidades', precioVenta: 11000 },
  { id: '5', nombre: 'Croissant', stockActual: 12, stockMinimo: 5, unidad: 'unidades', precioVenta: 900 },
  { id: '6', nombre: 'Cupcake', stockActual: 18, stockMinimo: 6, unidad: 'unidades', precioVenta: 700 },
  { id: '7', nombre: 'Galletas de mantequilla', stockActual: 40, stockMinimo: 15, unidad: 'unidades', precioVenta: 300 },
  { id: '8', nombre: 'Empanadas', stockActual: 10, stockMinimo: 4, unidad: 'unidades', precioVenta: 1500 },
];
