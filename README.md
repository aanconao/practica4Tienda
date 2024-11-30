El objetivo es desarrollar una API REST para un sistema de comercio electrónico que permite a los usuarios gestionar productos, agregar productos a un carrito, y realizar pedidos.

Entidades y Relaciones
Usuarios
Cada usuario tiene:
id (autogenerado).
nombre (string, requerido).
email (string, único y requerido).
password (string, requerido).
Productos
Cada producto tiene:
id (autogenerado).
nombre (string, requerido).
descripcion (string, opcional).
precio (float, requerido).
stock (integer, inicializado con una cantidad predeterminada).
Carritos
Cada carrito tiene:
id (autogenerado).
usuarioId (relación con un usuario, requerido).
productos (array de objetos con productoId, cantidad).
Relación: Un carrito está asociado a un usuario y puede contener uno o más productos.
Pedidos
Cada pedido tiene:
id (autogenerado).
usuarioId (relación con un usuario, requerido).
productos (array de objetos con productoId, cantidad y precio al momento del pedido).
total (float, calculado automáticamente).
fechaPedido (date, inicializada al momento del pedido).
Relación: Un pedido pertenece a un usuario y contiene uno o más productos.


Endpoints
1. Users
POST /users
Crear un nuevo usuario. Ejemplo del body esperado:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
 
Respuesta esperada:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
GET /users
Devuelve la lista de todos los usuarios registrados.
Respuesta esperada:
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
]
2. Products
GET /products
Devuelve una lista de todos los productos disponibles.
POST /products
Crea un nuevo producto. Ejemplo del body esperado:
{
  "name": "Smartphone",
  "description": "A high-end smartphone",
  "price": 999.99,
  "stock": 50
}
Respuesta esperada:
{
  "id": 1,
  "name": "Smartphone",
  "description": "A high-end smartphone",
  "price": 999.99,
  "stock": 50
}
PUT /products/:id
Actualiza un producto. Ejemplo del body para actualizar el stock:
{
  "stock": 30
}
Respuesta esperada:
{
  "id": 1,
  "name": "Smartphone",
  "description": "A high-end smartphone",
  "price": 999.99,
  "stock": 30
}
DELETE /products/:id
Elimina un producto, siempre que no esté en carritos o pedidos.
3. Carts
GET /carts?userId=1
Devuelve el carrito del usuario especificado. Incluye productos con su cantidad, nombre y precio total.
Respuesta esperada:
{
  "userId": 1,
  "products": [
    {
      "productId": 1,
      "name": "Smartphone",
      "quantity": 2,
      "price": 1999.98
    }
  ]
}
POST /carts/products?userId=1
Agrega un producto al carrito del usuario. Ejemplo del body:
{
  "productId": 1,
  "quantity": 2
}
Respuesta esperada:
{
  "userId": 1,
  "products": [
    {
      "productId": 1,
      "name": "Smartphone",
      "quantity": 2,
      "price": 1999.98
    }
  ]
}
DELETE /carts/products?userId=1&productId=1
Elimina un producto específico del carrito del usuario.
DELETE /carts?userId=1
Vacía completamente el carrito del usuario.
4. Orders
POST /orders?userId=1
Convierte el carrito del usuario en un pedido. Calcula el total automáticamente y descuenta el stock de los productos.
Respuesta esperada:
{
  "orderId": 1,
  "userId": 1,
  "products": [
    {
      "productId": 1,
      "name": "Smartphone",
      "quantity": 2,
      "price": 1999.98
    }
  ],
  "total": 1999.98,
  "date": "2024-11-26"
}
GET /orders?userId=1
Devuelve una lista de los pedidos realizados por el usuario.
Respuesta esperada:
[
  {
    "orderId": 1,
    "userId": 1,
    "products": [
      {
        "productId": 1,
        "name": "Smartphone",
        "quantity": 2,
        "price": 1999.98
      }
    ],
    "total": 1999.98,
    "date": "2024-11-26"
  }
]
Importante
1. Stock de productos:

No se puede agregar un producto al carrito si no hay suficiente stock.
Al confirmar un pedido, se debe descontar del stock los productos comprados.
2. Carrito vacío:

No se puede crear un pedido si el carrito está vacío.
3. Eliminación segura:

Un producto no puede eliminarse si está en un carrito o en un pedido.
