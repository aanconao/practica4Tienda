import { MongoClient, ObjectId } from "mongodb";
import type { ProductsModel, UsersModel, OrdersModel, CartsModel } from "./types.ts";
import { fromModelToCarts, fromModelToOrders, fromModelToProducts } from "./utils.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) {
  console.error("Problema con el MONGO_URL");
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Conectado a MongoDB :)");

const db = client.db("tienda");

const usersCollection = db.collection<UsersModel>("users");
const productsCollection = db.collection<ProductsModel>("products");
const cartsCollection = db.collection<CartsModel>("carts");
const ordersCollection = db.collection<OrdersModel>("orders");

const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  if (method === "GET") {
    
    if (path === "/users") { 
      const usersDB = await usersCollection.find().toArray();
      const users = usersDB.map((u) => ({
        id: u._id!.toString(),
        name: u.name,
        email: u.email,
      }));
      return new Response(JSON.stringify(users), { status: 200 });

    } else if (path === "/products") {  

      const productsDB = await productsCollection.find().toArray();
      const products = productsDB.map(fromModelToProducts);
      return new Response(JSON.stringify(products), { status: 200 });

    } else if (path === "/carts") {
      const userId = url.searchParams.get("userId");
      if (!userId) return new Response("Falta el id, de UserID", { status: 400 });

      const cart = await cartsCollection.findOne({userID: new ObjectId(userId)});

      if (!cart) return new Response("No hay Carrito", { status: 404 });

      const cartData = fromModelToCarts(cart); 
      
      return new Response(JSON.stringify(cartData), { status: 200 });

    } else if (path === "/orders") {
      
      const userId = url.searchParams.get("userId");
      if (!userId) return new Response("Falta el id, de UserID", { status: 400 });

      const ordersDB = await ordersCollection.find({ userID: new ObjectId(userId) }).toArray();

      const orders = ordersDB.map((o) => fromModelToOrders(o)); 

      return new Response(JSON.stringify(orders), { status: 200 });
    }


  } else if (method === "POST") {

    if (path === "/users") {

      const user = await req.json();
      if (!user.name || !user.email || !user.password) return new Response("Faltan atributos", { status: 400 });

      const { insertedId } = await usersCollection.insertOne(user);
      
      return new Response(
        JSON.stringify({
          id: insertedId.toString(),
          name: user.name,
          email: user.email,
        }),
        { status: 201 }
      );

    } else if (path === "/products") {

      const product = await req.json();
      if (!product.name || !product.price || !product.stock) return new Response("Faltan atributos", { status: 400 });
      
      const { insertedId } = await productsCollection.insertOne(product);
      
      return new Response(JSON.stringify({
        id: insertedId.toString(),
        name:product.name,
        description:product.description,
        price:product.price,
        stock:product.stock,
        }),
        { status: 201 }
      );

    } else if (path === "/carts/products") {

      const userId = url.searchParams.get("userId");
      const body = await req.json();

      if (!userId || !body.productId || !body.quantity)return new Response("Faltan atributos", { status: 400 });
      
      const product = await productsCollection.findOne({_id: new ObjectId(body.productId)});

      if (!product || product.stock < body.quantity) return new Response("No hay suficiente stock", { status: 400 });
      
      const cart = await cartsCollection.findOne({userID: new ObjectId(userId),});

      if (!cart) {
        await cartsCollection.insertOne({
          userID: new ObjectId(userId),
          products: [{ productID: new ObjectId(body.productId), quantity: body.quantity }],
        });
      } else {
        await cartsCollection.updateOne(
          { _id: cart._id },
          {$push: {products: { productID: new ObjectId(body.productId), quantity: body.quantity },},
          }
        );
      }
      return new Response("Producto anadido al carrito", { status: 201 });

    } 

  } else if (method === "DELETE") {
    if (path.startsWith("/products")) {
      
      const id = path.split("/")[2];
      if (!id) return new Response("ID no encontrado", { status: 400 });

      const { deletedCount } = await productsCollection.deleteOne({_id: new ObjectId(id)});

      if (deletedCount === 0) {
        return new Response("Producto no encontrado", { status: 404 });
      }
      return new Response("Producto eliminado", { status: 200 });

    } else if (path === "/carts") {

      const userId = url.searchParams.get("userId");
      if (!userId) return new Response("Falta ID de usuario", { status: 400 });

      const { deletedCount } = await cartsCollection.deleteOne({userID: new ObjectId(userId)});
      
      if (deletedCount === 0) {
        return new Response("Cart no encontrado", { status: 404 });
      }

      return new Response("Se borro exitosamente el Cart", { status: 200 });
    }
  }

  return new Response("Endpoint not found", { status: 404 });
};

Deno.serve({ port: 3000 }, handler);
