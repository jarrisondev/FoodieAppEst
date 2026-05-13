# FoodieApp — Solución del Taller 2

Documento de sustentación: explica cada **bug corregido** y cada **feature implementada**, con el archivo afectado, qué estaba mal / qué se agregó, y por qué la solución es correcta.

> Si en la sustentación les asignan **1 bug + 1 feature**, escojan uno de cada sección. Las más fáciles de defender en 30 min son: **Bug #1 (cantidades duplicadas en carrito)** + **F01 (búsqueda)** o **F06 (IVA)**.

---

## 🐞 BUGS CORREGIDOS

### Bug #1 — Carrito guarda duplicados en vez de sumar cantidad
**Archivo:** `src/context/CartContext.js` → función `addToCart`

**Problema:**
```js
const addToCart = (dish) => {
  const updatedCart = [...cartItems];
  updatedCart.push({ id: dish.id, name: ..., quantity: 1 }); // siempre push
  setCartItems(updatedCart);
};
```
Cada vez que el usuario tocaba "Agregar al carrito" se creaba un item nuevo, en vez de incrementar la cantidad del plato existente.

**Solución:**
```js
const existing = cartItems.find(item => item.id === dish.id);
if (existing) {
  updatedCart = cartItems.map(item =>
    item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
  );
} else {
  updatedCart = [...cartItems, { id: dish.id, ..., quantity: 1, notes: '' }];
}
```
**Por qué funciona:** Primero verificamos con `find` si ya existe el plato. Si existe, devolvemos un **nuevo array** con `map` incrementando la cantidad (inmutabilidad → React detecta el cambio y re-renderiza). Si no, lo agregamos por primera vez.

---

### Bug #2 — AsyncStorage guarda y lee mal el carrito
**Archivo:** `src/context/CartContext.js` → `loadCart` y `saveCart`

**Problema:**
```js
setCartItems(stored);                                     // string en vez de array
await AsyncStorage.setItem('@foodie_cart', items);        // objeto en vez de string
```
`AsyncStorage` solo almacena **strings**. Si guardas un array directo, internamente queda como `"[object Object]"`. Al leer, `stored` es un string y `setCartItems(stored)` rompe el FlatList porque `cartItems.reduce(...)` falla.

**Solución:**
```js
await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
setCartItems(JSON.parse(stored));
```
**Por qué funciona:** Serializamos a JSON al escribir y des-serializamos al leer. Mismo bug se arregla en `ProfileScreen.loadProfile` (que también olvidaba el `JSON.parse`).

---

### Bug #3 — Badge del carrito no se actualiza
**Archivo:** `src/context/CartContext.js`

**Problema:**
```js
useEffect(() => {
  const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  setCartCount(total);
}, []); // ← dependencia vacía
```
El efecto solo corre al montar. Cuando agregabas un plato, `cartItems` cambiaba pero `cartCount` quedaba en 0.

**Solución:**
```js
}, [cartItems]);
```
**Por qué funciona:** Con `[cartItems]` el efecto se vuelve a ejecutar cada vez que cambia el carrito, recalculando el total para el badge.

---

### Bug #4 — `removeFromCart` muta el estado
**Archivo:** `src/context/CartContext.js` → `removeFromCart`

**Problema:**
```js
const updatedCart = cartItems;        // referencia al mismo array
updatedCart.splice(index, 1);         // mutación directa
setCartItems(updatedCart);            // misma referencia → React no re-renderiza
```

**Solución:**
```js
const updatedCart = cartItems.filter(item => item.id !== dishId);
```
**Por qué funciona:** `filter` retorna un array **nuevo**, respetando la inmutabilidad de React.

---

### Bug #5 — `MenuScreen` hace fetch en bucle infinito
**Archivo:** `src/screens/MenuScreen.js`

**Problema:**
```js
useEffect(() => {
  fetchMenu();
}); // ← sin array de dependencias
```
Sin segundo argumento, el efecto corre **en cada render** → llama a `fetchMenu` → llama a `setDishes` → render → efecto otra vez → loop infinito (lag, llamadas Firestore sin parar).

**Solución:**
```js
useEffect(() => {
  fetchMenu();
}, []);
```
**Por qué funciona:** Con `[]` el efecto se ejecuta una sola vez al montar el componente.

---

### Bug #6 — `keyExtractor` usa el índice
**Archivo:** `src/screens/MenuScreen.js`

**Problema:**
```js
keyExtractor={(item, index) => index.toString()}
```
Usar `index` como key produce bugs de render cuando la lista cambia de orden o se filtra: React reutiliza componentes mal y arrastra estado de un item a otro.

**Solución:**
```js
keyExtractor={(item) => item.id}
```
**Por qué funciona:** El `id` del plato es único y estable, así React identifica correctamente cada elemento.

---

### Bug #7 — `DishDetailScreen` no muestra el plato
**Archivo:** `src/screens/DishDetailScreen.js`

**Problema:** Tres bugs juntos:
1. `import { View, Text, ... }` no incluía `ScrollView`, pero el JSX usaba `<ScrollView>` → error de runtime.
2. `const { dish } = route.params;` — pero `MenuScreen` pasa `dishId`, `dishName`, `dishPrice`, etc. como parámetros sueltos. `dish` siempre era `undefined`.
3. `<TouchableOpacity onClick={handleAddToCart}>` — en React Native el prop correcto es **`onPress`**, no `onClick` (eso es web).

**Solución:**
```js
import { ..., ScrollView } from 'react-native';
const { dishId, dishName, dishPrice, dishImage, dishRating, dishCategory, dishDescription } = route.params || {};
<TouchableOpacity onPress={handleAddToCart}>
```
**Por qué funciona:** Importamos el componente faltante, destructuramos los params reales que envía la navegación, y usamos el evento correcto para móvil.

---

### Bug #8 — `ProfileScreen` no carga el perfil ni renderiza
**Archivo:** `src/screens/ProfileScreen.js`

**Problema:**
1. `const profile = stored;` — el string de AsyncStorage nunca se parsea, así que `profile.name` es `undefined`.
2. Usa `<ScrollView>` sin importarlo.

**Solución:**
```js
import { ..., ScrollView } from 'react-native';
const profile = JSON.parse(stored);
```

---

## ✨ FEATURES IMPLEMENTADAS

### F01 — Barra de búsqueda en el menú
**Archivo:** `src/screens/MenuScreen.js`

**Qué se hizo:**
- Estado `const [search, setSearch] = useState('');`
- `<TextInput>` arriba de la lista con placeholder "Buscar platos..." y botón ✕ que vacía el input.
- Filtro combinado:
  ```js
  dishes
    .filter(d => selectedCategory === 'Todas' || d.category === selectedCategory)
    .filter(d => d.name.toLowerCase().includes(search.trim().toLowerCase()));
  ```
- Cuando no hay coincidencias, `ListEmptyComponent` muestra "No se encontraron platos".

**Por qué cumple los criterios:**
- Filtra en tiempo real (cada `onChangeText` actualiza estado → re-render → lista filtrada).
- No es case-sensitive (`toLowerCase()` en ambos lados).
- El botón ✕ aparece solo si hay texto y limpia el estado.

---

### F02 — Sistema de favoritos
**Archivos:** `src/screens/DishDetailScreen.js` + `src/screens/ProfileScreen.js`

**Qué se hizo:**
- Clave de storage `@foodie_favorites` con un array de objetos `{ id, name, price, image, category }`.
- En **DishDetailScreen**: `useEffect` carga si el plato actual está en la lista. Botón ♡/♥ que hace toggle y persiste con `AsyncStorage.setItem(..., JSON.stringify(...))`.
- En **ProfileScreen**: sección "Mis Favoritos" que lista los platos guardados con su imagen, nombre y precio, más un botón ✕ para removerlos. Usamos `useFocusEffect` para recargar la lista cada vez que la pantalla recibe foco (así, si marcas un favorito y vuelves a Perfil, se ve actualizado).

**Por qué cumple:** El estado del corazón se sincroniza al abrir el detalle (`useEffect([dishId])`), se persiste con AsyncStorage (sobrevive cerrar la app), y se muestra/elimina desde Perfil.

---

### F03 — Notas especiales por plato en el carrito
**Archivos:** `src/context/CartContext.js` + `src/screens/CartScreen.js`

**Qué se hizo:**
- En el contexto se agregó `updateNotes(dishId, notes)` que hace `cartItems.map(...)` y actualiza solo el item afectado.
- En cada `cartItemCard` hay un `<TextInput multiline>` con placeholder "Notas especiales: sin cebolla, extra picante...". `value={item.notes}` y `onChangeText={(t) => updateNotes(item.id, t)}`.
- Al confirmar pedido, `cartItems` (con sus `notes`) se envía completo a `db.collection('orders').add({ items: cartItems, ... })`.

**Por qué cumple:** Cada item tiene su nota independiente, se asocia por `id`, viaja al pedido en Firestore y es opcional (default `''`, no causa errores si está vacío).

---

### F04 — Filtro horizontal por categoría
**Archivo:** `src/screens/MenuScreen.js`

**Qué se hizo:**
- Estado `selectedCategory` (default `'Todas'`).
- `<ScrollView horizontal>` con los chips, leyendo el array `CATEGORIES` de `seedData.js`.
- Chip activo: fondo naranja primario, texto blanco. Inactivo: fondo blanco, borde gris.
- Filtro `dishes.filter(d => selectedCategory === 'Todas' ? true : d.category === selectedCategory)`.

**Por qué cumple:** Es un `ScrollView horizontal` con scroll real, la categoría activa se resalta visualmente, "Todas" muestra todo, y se aplica al instante porque cambia el estado de React.

---

### F05 — Toggle de modo oscuro
**Archivo:** `src/screens/ProfileScreen.js`

**Qué se hizo:**
- Estado `darkMode`, clave `@foodie_dark_mode`.
- Componente `<Switch>` con etiqueta "🌙 Modo Oscuro" que llama `toggleDarkMode(value)` → actualiza estado y guarda en AsyncStorage.
- Dos paletas (`lightTheme` y `darkTheme`) que se aplican condicionalmente: fondos, superficies, bordes, textos primarios/secundarios.

**Por qué cumple:** El toggle alterna, persiste, y los colores oscuros son legibles (`#0F172A` fondo / `#F8FAFC` texto, con surface `#1E293B` para tarjetas). No es invertir; es una paleta definida.

---

### F06 — Cálculo de total con IVA (19%)
**Archivo:** `src/screens/CartScreen.js`

**Qué se hizo:**
```js
const IVA_RATE = 0.19;
const subtotal = getCartTotal();
const iva = subtotal * IVA_RATE;
const total = subtotal + iva;
```
En la sección inferior se muestran tres filas: **Subtotal**, **IVA (19%)**, **Total**. Cada valor formateado con `.toLocaleString('es-CO')`. El botón "Confirmar Pedido" muestra el total final con IVA: `Confirmar Pedido • $XXX`.

**Por qué cumple:** Los tres valores se derivan del `cartItems`, así que al agregar/quitar/cambiar cantidades se recalculan automáticamente (re-render de React). Usamos `Math.round` para evitar mostrar decimales feos en pesos colombianos.

---

### F07 — Calificación post-pedido con estrellas
**Archivo:** `src/screens/OrderHistoryScreen.js`

**Qué se hizo:**
- En cada `orderCard`, si `item.status === 'delivered'`, se renderiza una fila de 5 estrellas (`☆`/`★`).
- Al tocar una estrella se llama `rateOrder(item.id, n)` que:
  1. Guarda la calificación en estado local (`localRatings`) para feedback inmediato.
  2. Hace `db.collection('orders').doc(orderId).update({ rating })`.
- Si el pedido ya tiene `rating` guardado, las estrellas quedan **bloqueadas** (`disabled`) y solo muestran el valor.

**Por qué cumple:** Solo aparece en pedidos entregados, al tocar la N llena N estrellas (porque comparamos `n <= currentRating`), persiste en Firestore y no se puede sobrescribir.

---

### F08 — Selector de cantidad (+/−)
**Archivos:** `src/context/CartContext.js` + `src/screens/CartScreen.js`

**Qué se hizo:**
- En el contexto: `incrementQuantity(id)` y `decrementQuantity(id)`. Si la cantidad llega a 0, se llama a `removeFromCart`.
- En el carrito: dos botones redondos de 40×40 con `−` y `+` a los lados del valor de cantidad.
- Subtotal del item recalculado en cada render: `item.price * item.quantity`.

**Por qué cumple:** Botones grandes (40×40 mínimo), `+` incrementa, `−` decrementa (o elimina si llega a 0), y todos los totales se actualizan automáticamente porque dependen de `cartItems`.

---

## 🗺️ MAPA RÁPIDO DE ARCHIVOS TOCADOS

| Archivo | Bugs | Features |
|---|---|---|
| `src/context/CartContext.js` | #1, #2, #3, #4 | F03, F08 |
| `src/screens/MenuScreen.js` | #5, #6 | F01, F04 |
| `src/screens/DishDetailScreen.js` | #7 | F02 |
| `src/screens/CartScreen.js` | — | F03, F06, F08 |
| `src/screens/ProfileScreen.js` | #8 | F02, F05 |
| `src/screens/OrderHistoryScreen.js` | — | F07 |

---

## 🎤 GUION DE 30 MIN (si les toca 1 bug + 1 feature)

**Sugerencia segura para defender:**

1. **Bug #5 (useEffect infinito en MenuScreen)** — fácil de explicar, muy didáctico:
   - Mostrar el `useEffect` sin `[]` → explicar que React re-ejecuta cada render → mostrar consola con N llamadas a Firestore.
   - Aplicar el fix `}, []);` → mostrar consola con una sola llamada.
   - 5 minutos máximo.

2. **F06 (IVA)** — visual, calculable a mano, sin dependencias externas:
   - Mostrar el carrito antes (solo subtotal y total iguales).
   - Agregar las constantes `IVA_RATE`, `subtotal`, `iva`, `total`.
   - Agregar las tres filas en el JSX.
   - Probar agregando 2 platos → ver cómo cambian los tres valores en vivo.
   - Explicar que el botón "Confirmar" muestra ya el total con IVA.
   - 10 minutos cómodos.

**Mensaje en la sustentación:**
> "Identificamos que el carrito tenía un bug donde el `useEffect` corría infinitamente porque no tenía array de dependencias. Lo arreglamos pasándole `[]` para que solo se ejecute al montar el componente. Para la feature, implementamos el cálculo de IVA al 19%: agregamos las tres líneas (subtotal, IVA, total) que se recalculan automáticamente porque dependen de `cartItems`, y formateamos los valores en pesos colombianos."
