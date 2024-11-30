import { ObjectId, type OptionalId } from "mongodb";

export type UsersModel = OptionalId<{
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  carts?: ObjectId;
  orders?: ObjectId[]; 
}>;

export type Users = {
  id: string;
  name: string;
  email: string;
  password: string;
  carts: string; 
  orders: Orders[]; 
};

export type ProductsModel = OptionalId<{
  name: string;
  description?: string;
  price: number;
  stock: number;
}>;

export type Products = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
};

export type CartsModel = OptionalId<{
  _id: ObjectId;
  userID: ObjectId; 
  products: {
    productID: ObjectId; 
    quantity: number; 
  }[];
}>;

export type Carts = {
  id: string;
  userID: string; 
  products?: {
    productID: string; 
    quantity: number; 
  }[];
};

export type OrdersModel = OptionalId<{
  _id: ObjectId;
  userID: ObjectId; 
  total: number; 
  orderDate: Date; 
  products: {
    productID: ObjectId; 
    quantity: number; 
    price: number;
  }[];
}>;

export type Orders = {
  id: string;
  userID: string; 
  total: number; 
  orderDate: Date; 
  products?: {
    productID: string; 
    quantity: number;
    price: number; 
  }[];
};
