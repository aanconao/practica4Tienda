import type {ProductsModel,Products,UsersModel,Users,
  Orders,
  CartsModel,
  OrdersModel,
  Carts,
} from "./types.ts";
import { Collection } from "mongodb";

export const fromModelToProducts = (product: ProductsModel): Products => ({
  id: product._id!.toString(),
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
});

export const fromModelToOrders = async (
  order: OrdersModel,
): Promise<Orders> => {
  
  return {
    id: order._id!.toString(),
    userID: order.userID.toString(),
    total: order.total,
    orderDate: order.orderDate
  };
};

export const fromModelToUsers = async (
  user: UsersModel,
  carts: CartsModel,
  ordersCollection: Collection<OrdersModel>,
): Promise<Users> => {

  const orders = await ordersCollection.find({ _id: { $in: user.orders } }).toArray();

  const userOrders = await Promise.all(orders.map((order) => fromModelToOrders(order)));
  
  return {
    id: user._id!.toString(),
    name: user.name,
    email: user.email,
    password: user.password,
    carts: carts._id!.toString(),
    orders: userOrders,
  };
};

export const fromModelToCarts = async (
  cart: CartsModel,
): Promise<Carts> => {
  
  return {
    id: cart._id!.toString(),
    userID: cart.userID.toString(),
  };
};
