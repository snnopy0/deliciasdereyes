<<<<<<< HEAD
Delicias de Reyes App

Aplicación móvil desarrollada con React Native y Expo para apoyar la gestión de una panadería.  
Permite registrar ventas diarias, pedidos, controlar inventario y generar reportes, con acceso diferenciado según el tipo de usuario.


Objetivo del sistema


Resolver los siguientes problemas del negocio:

1. Registrar ventas diarias  
   Evitar pérdida de ventas o cobros incorrectos llevando un registro claro de lo vendido cada día.

2. Llevar registro de pedidos  
   Registrar pedidos de clientes y ver su estado (pendiente o entregado), evitando que se olviden.

3. Control de inventario  
   Mantener actualizado el stock de insumos y productos, incluyendo una sección para productos con poco stock.

4. Reportes de ventas  
   Visualizar un resumen de ventas por producto e identificar cuáles son los más solicitados.

5. Acceso diferenciado por usuario  
   - Área de ventas: acceso completo.  
   - Área de producción: acceso solo a pedidos e inventario.


Funcionalidades principales


Login y roles de usuario
- Pantalla de inicio de sesión “Delicias de Reyes App”.
- Inicio de sesión con usuario y contraseña.
- Dos tipos de usuario:
  - ventas: acceso a Ventas, Pedidos, Inventario y Reportes.
  - produccion: acceso a Pedidos e Inventario.
- La sesión se maneja mediante Context API.

Módulo de ventas
- Registrar ventas diarias seleccionando productos y cantidades.
- Cálculo del total de la venta.
- Descuento de stock en el inventario al registrar una venta.
- Listado de ventas del día.

Módulo de pedidos
- Registro de pedidos de clientes:
  - Nombre del cliente.
  - Producto y cantidad.
- Estado del pedido:
  - Pendiente.
  - Entregado.
- Listado de todos los pedidos con indicación del estado.
- El área de producción utiliza esta vista para saber qué debe preparar.

Módulo de inventario
- Lista de productos con:
  - Nombre.
  - Stock actual.
  - Unidad.
  - Stock mínimo recomendado.
- Sección de productos con poco stock.
- Posibilidad de ajustar manualmente el stock (sumar o restar).

Módulo de reportes
- Resumen de ventas por producto.
- Listado de productos más vendidos.
- Totales de cantidades y montos vendidos.


Tecnologías utilizadas


- React Native (Expo).
- TypeScript.
- React Context para manejo de estado global.
- AsyncStorage para persistencia local en el dispositivo.
- Expo Go para pruebas en iOS y Android.
- Ionicons (a través de @expo/vector-icons) para íconos.


Cómo ejecutar el proyecto


1. Clonar el repositorio:

   git clone https://github.com/snnopy0/deliciasdereyes
   cd delicias-de-reyes-app

2. Instalar dependencias:

   npm install

3. Ejecutar con Expo:

   npx expo start

En la consola de Expo se puede:
- Presionar w para abrir la aplicación en el navegador (web).
- Usar la aplicación Expo Go en iOS o Android para escanear el código QR y probar en el celular.

Usuarios de prueba


Usuario de ventas (acceso completo):
- Usuario: ventas
- Contraseña: 1234

Usuario de producción (acceso limitado):
- Usuario: produccion
- Contraseña: 1234


Persistencia de datos


- La información (ventas, pedidos, inventario) se guarda en AsyncStorage, por lo que:
  - Los datos se mantienen al cerrar y abrir la aplicación.
  - Todo se maneja localmente, sin necesidad de servidor.

=======
# deliciasdereyes
>>>>>>> 6f3acf224949e139b7b456c55c1e7b864d779a3e
