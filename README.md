# FoodieApp - Taller de Debug & Features

Aplicación de pedidos de restaurante

## Nota Importante
Esta aplicación contiene **bugs intencionales** y **features por implementar** como parte del taller práctico.

##  Tecnologías
- React Native CLI 0.79.x
- React Navigation (Stack + Bottom Tabs)
- AsyncStorage
- Firebase/Firestore
- react-native-vector-icons

##  Configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/[USUARIO]/FoodieApp.git
cd FoodieApp

# 2. Instalar dependencias
npm install

# 3. Instalar pods (iOS)
cd ios && pod install && cd ..

# 4. Ejecutar
npx react-native run-ios
# o
npx react-native run-android
```

## 📁 Estructura del Proyecto

```
src/
├── config/firebase.js        # Configuración Firebase
├── context/CartContext.js    # Estado global del carrito
├── navigation/               # Stack y Tab navigators
├── screens/                  # Pantallas de la app
├── styles/globalStyles.js    # Estilos compartidos
└── utils/seedData.js         # Datos del menú
```

