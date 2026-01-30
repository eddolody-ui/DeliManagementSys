import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const loginUser = async (username: string, password: string) => {
  const response = await api.post('/api/auth/login', { username, password });
  return response.data;
};

export const registerUser = async (username: string, password: string, role: string) => {
  const response = await api.post('/api/auth/register', { username, password, role });
  return response.data;
};

/**
 * logoutUser Function
 *
 * Logs out the user by clearing local storage.
 *
 * Relationships:
 * - Called from AuthContext to log out the user
 * - Clears accessToken and user from localStorage
 */
export const logoutUser = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

/**
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
  Status: string | 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled'| 'RTS';
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

/**
 * updateOrderStatus Function
 *
 * Updates the status of an order and logs the change.
 *
 * Relationships:
 * - Called from OrderDetail component to update order status
 * - Sends PATCH request to /api/orders/:trackingId/status
 * - Backend updates order status and appends log entry
 */
export const updateOrderStatus = async (trackingId: string, status: string, message?: string, createdBy?: string) => {
  const res = await api.patch(`/api/orders/${trackingId}/status`, { status, message, createdBy });
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

/**
 * addOrderToRoute Function
 *
 * Adds an order to a route by tracking ID.
 *
 * Relationships:
 * - Called from RouteDetail component to add orders to a route
 * - Sends POST request to /api/routes/:routeId/orders/:trackingId
 * - Backend adds the order to the route's orders array
 */
export const addOrderToRoute = async (routeId: string, trackingId: string) => {
  const res = await api.post(`api/routes/${routeId}/orders/${trackingId}`);
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

/**
 * addOrderToShipment Function
 *
 * Adds an order to a shipment by tracking ID.
 *
 * Relationships:
 * - Called from ShipmentDetail component to add orders to a shipment
 * - Sends POST request to /api/shipments/:shipmentId/orders/:trackingId
 * - Backend adds the order to the shipment's orders array
 */
export const addOrderToShipment = async (shipmentId: string, trackingId: string) => {
  const res = await api.post(`api/shipments/${shipmentId}/orders/${trackingId}`);
  return res.data;
};

//..........................................................................................................//
