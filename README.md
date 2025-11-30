Delicias de Reyes App

Aplicación móvil para una panadería que permite:

- Registrar ventas diarias (descuenta stock automáticamente).
- Registrar y gestionar pedidos de clientes (pendiente / entregado).
- Llevar control de inventario, incluyendo sección “Se acabará pronto”.
- Ver reportes de ventas y productos más vendidos.
- Manejar acceso por roles:
  - `ventas` → acceso completo.
  - `produccion` → acceso solo a pedidos e inventario.

Tecnologías

- React Native + Expo
- TypeScript
- AsyncStorage (persistencia local en el dispositivo)

 Cómo ejecutar el proyecto

```bash
git clone https://github.com/catuwolf/delicias-de-reyes-app.git
cd delicias-de-reyes-app
npm install
npx expo start
