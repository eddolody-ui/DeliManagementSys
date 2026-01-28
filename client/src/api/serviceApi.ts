
/**
 * updateOrderStatus Function
 * Relationships:
 * - Called from OrderDetail page when status is changed
 * - PATCH /api/orders/:trackingId/status endpoint
 */
export const updateOrderStatus = async (
  trackingId: string,
  status: string,
  message?: string,
  createdBy?: string
) => {
  const res = await api.patch(`/api/orders/${trackingId}/status`, {
    status,
    message,
    createdBy,
  });
  return res.data;
};

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

export const addOrderToRoute = async (
  routeId: string,
  trackingId: string
) => {
  try {
    const res = await api.put(`/api/routes/${routeId}`, { trackingId });
    return res.data;
  } catch (error: any) {
    if (error.response) {
      // Backend returned an error
      throw new Error(error.response.data.message || "Failed to add order");
    } else {
      throw new Error(error.message || "Network error");
    }
  }
};
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
  const res = await api.post("api/orders", orderData);
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
  const res = await api.get("/api/orders");
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
  const res = await api.get(`/api/orders/${trackingId}`);
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
  const res = await api.post("api/shippers", shipperData);
  return res.data;
};

export const getShipper = async (id: string): Promise<ShipperData & { _id: string }> => {
  const res = await api.get(`api/shippers/${id}`);
  return res.data;
};

export const getShippers = async (): Promise<(ShipperData & { _id: string })[]> => {
  const res = await api.get("api/shippers");
  return res.data;
};

//..........................................................................................................//

export interface RouteData {
  RouteId?: string;
  Hub: string;
  AssignPersonName: string;
  DateCreated?: Date;
  orders?: (OrderData & { _id: string; createdAt: string; updatedAt: string })[];
  totalAmount?: number;
  log?: {
    status: string;
    message?: string;
  }[];
}
export const createRoute = async (RouteData: RouteData) => {
  const res = await api.post("api/routes", RouteData);
  return res.data;
}

export const getRoutes = async (): Promise<RouteData[]> => {
  const res = await api.get("api/routes");
  return res.data;
};

export const getRoute = async (id: string): Promise<RouteData & { _id: string; orders?: (OrderData & { _id: string; createdAt: string; updatedAt: string })[] }> => {
  const res = await api.get(`api/routes/${id}`);
  console.log("API response:", res.data);
  return res.data;
};

//..........................................................................................................//

export interface ShipmentData {
  ShipmentId?: string;
  FromHub: string;
  ToHub: string,
  DateCreated?: Date;
  orders?: (OrderData & { _id: string; createdAt: string; updatedAt: string })[];
  log?: {
    status: string;
    message?: string;
  }[];
}
export const createShipment = async (ShipmentData: ShipmentData) => {
  const res = await api.post("api/shipments", ShipmentData);
  return res.data;
}

export const getShipments = async (): Promise<ShipmentData[]> => {
  const res = await api.get("api/shipments");
  return res.data;
};

export const getShipment = async (id: string): Promise<ShipmentData & { _id: string; orders?: (OrderData & { _id: string; createdAt: string; updatedAt: string })[] }> => {
  const res = await api.get(`api/shipments/${id}`);
  console.log("API response:", res.data);
  return res.data;
};

//..........................................................................................................//
