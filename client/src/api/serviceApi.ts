
/**
 * updateOrderStatus Function
 * Relationships:
 * - Called from OrderDetail page when status is changed
 * - PATCH /api/orders/:trackingId/status endpoint
 */
export const updateOrderStatus = async ( // * Updates the status of an order and appends a log entry.
  trackingId: string,
  status: string,
  message?: string,
  createdBy?: string
) => {
  const res = await api.patch(`/orders/${trackingId}/status`, {
    status,
    message,
    createdBy,
  });
  return res.data;
};
import api from "./axois";

/**
 * OrderData Interface
 * 
 * Application တစ်လျှောက် အသုံးပြုသော order data ၏ structure ကို define လုပ်သည်။
 * ဤ interface သည် frontend forms နှင့် backend API ကြားတွင် type safety ကို ensure လုပ်သည်။
 * 
 * Relationships:
 * - createOrder function မှ input data ကို validate လုပ်ရန် အသုံးပြုသည်
 * - getOrders function မှ backend မှ return လုပ်သော data ဖြစ်သည်
 * - CreateOrderForm component မှ form state management အတွက် အသုံးပြုသည်
 * - Backend ရှိ MongoDB Order schema နှင့် match ဖြစ်သည်
 */
export interface OrderData {
  TrackingId: string;
  CustomerName: string;
  CustomerContact: string;
  CustomerAddress: string;
  Amount: number;
  Type: string;
  Note: string;
  shipperId?: string | ShipperData;
  Status: string | 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';
  log?: {
    status: string;
    timestamp: string;
    message?: string;
    createdBy?: string;
  }[];
}

export interface OrderLog {
  status: string
  message?: string
  createdAt: string
  createdBy?: string
}

/**
 * createOrder Function
 * 
 * Order data ကို backend API သို့ send လုပ်ပြီး database တွင် အသစ်စက်စက် order ကို create လုပ်သည်။
 * 
 * Relationships:
 * - CreateOrderForm component ၏ handleSubmit မှ call လုပ်သည်
 * - Type validation အတွက် OrderData interface ကို အသုံးပြုသည်
 * - /api/orders endpoint သို့ POST request လုပ်သည်
 * - Confirmation အတွက် backend မှ created order data ကို return လုပ်သည်
 * - Backend server ၏ saveOrder function နှင့် connected ဖြစ်သည်
 */
export const createOrder = async (orderData: OrderData) => {
  const res = await api.post("/orders", orderData);
  return res.data;
};

/**
 * getOrders Function
 * 
 * Orders table တွင် display လုပ်ရန် backend API မှ order အားလုံးကို fetch လုပ်သည်။
 * 
 * Relationships:
 * - DataTableDemo component မှ mount တွင် call လုပ်သည်
 * - Table rendering အတွက် OrderData[] array ကို return လုပ်သည်
 * - /api/orders endpoint သို့ GET request လုပ်သည်
 * - Backend server ၏ Order.find({}) နှင့် connected ဖြစ်သည်
 * - Order page table တွင် data ကို display လုပ်သည်
 */
export const getOrders = async (): Promise<OrderData[]> => {
  const res = await api.get("/orders");
  return res.data;
};

/**
 * getOrder Function
 * 
 * Specific order ကို tracking ID ဖြင့် fetch လုပ်သည်။
 * 
 * Relationships:
 * - OrderDetail page တွင် single order data ကို display လုပ်ရန် အသုံးပြုသည်
 * - /api/orders/:trackingId endpoint သို့ GET request လုပ်သည်
 * - Backend server ၏ Order.findOne() နှင့် connected ဖြစ်သည်
 */
export const getOrder = async (trackingId: string): Promise<OrderData & { _id: string; createdAt: string; updatedAt: string }> => {
  const res = await api.get(`/orders/${trackingId}`);
  return res.data;
};
//..........................................................................................................//

export interface ShipperData {
  ShipperId: string;
  ShipperName: string;
  ShipperContact: string;
  ShipperAddress: string;
  PickUpAddress: string;
  BillingType: string;
  Note: string;
}

export const createShipper = async (shipperData: ShipperData) => {
  const res = await api.post("/shippers", shipperData);
  return res.data;
};

export const getShipper = async (id: string): Promise<ShipperData & { _id: string }> => {
  const res = await api.get(`/shippers/${id}`);
  return res.data;
};

export const getShippers = async (): Promise<(ShipperData & { _id: string })[]> => {
  const res = await api.get("/shippers");
  return res.data;
};

//..........................................................................................................//

export interface RouteData {
  RouteId?: string;
  Hub: string;
  AssignPersonName: string;
  DateCreated?: Date;
}
export const createRoute = async (RouteData: RouteData) => {
  const res = await api.post("/routes", RouteData);
  return res.data;
}

export const getRoutes = async (): Promise<RouteData[]> => {
  const res = await api.get("/routes");
  return res.data;
};

export const getRoute = async (id: string): Promise<RouteData & { _id: string }> => {
  const res = await api.get(`/routes/${id}`);
  console.log("API response:", res.data);
  return res.data;
};

//..........................................................................................................//
