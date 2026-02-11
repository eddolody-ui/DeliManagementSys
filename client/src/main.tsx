import { StrictMode } from "react";
  import { createRoot } from "react-dom/client";
  import {HomePage} from "./features/home/pages/HomePage.tsx";
  import "./index.css";
  import { SidebarProvider } from "./components/ui/sidebar.tsx";
  import { createBrowserRouter, RouterProvider } from "react-router-dom"
  import { Order } from "./features/home/pages/Order.tsx";
  import { CreateOrderForm } from "./features/home/pages/CreateOrder.tsx";
  import { Shipper } from "./features/home/pages/Shipper";
  import { CreateShipper } from "./features/home/pages/CreateShipper";
  import { OrderDetail } from "./features/home/pages/OrderDetail.tsx";
  import { ShipperDetail } from "./features/home/pages/ShipperDetail.tsx";
  import { RoutePage } from "./features/home/pages/Route.tsx";
  import { RouteDetail } from "./features/home/pages/RouteDetail.tsx";
  import { ShipmentPage } from "./features/home/pages/Shipment.tsx";
  import { ShipmentDetail } from "./features/home/pages/ShipmentDetail.tsx";
  import {Finance} from "./features/home/pages/Finical.tsx"
  import { AuthProvider } from "./context/AuthContext";
  import Login from "./components/Login";
  import ProtectedRoute from "./components/ProtectedRoute.tsx";
  import { Profile } from "./features/home/pages/Profile.tsx";


  const router =createBrowserRouter ([
    {path: '/login',element:<Login/>},
    {path: '/',element:<ProtectedRoute><HomePage/></ProtectedRoute>},
    {path:'/Order',element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><Order/></ProtectedRoute>},
    {path:'/Order/CreateOrder',element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><CreateOrderForm/></ProtectedRoute>},
    {path:'/Shipper',element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><Shipper/></ProtectedRoute>},
    {path:'/Shipper/CreateShipper',element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><CreateShipper/></ProtectedRoute>},
    {path:"/Order/:trackingId", element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><OrderDetail /></ProtectedRoute>},
    {path:"/Shipper/:shipperId", element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><ShipperDetail /></ProtectedRoute>},
    {path:"/Shipper/:shipperId/CreateOrder", element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><CreateOrderForm /></ProtectedRoute>},
    {path:"/Route", element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><RoutePage /></ProtectedRoute>},
    {path:"/Route/:RouteId", element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><RouteDetail /></ProtectedRoute>},
    {path:"/Shipment", element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><ShipmentPage /></ProtectedRoute>},
    {path:"/Shipment/:ShipmentId", element:<ProtectedRoute allowedRoles={['Admin', 'Operation']}><ShipmentDetail /></ProtectedRoute>},
    {path:"/Finance/Shipper", element:<ProtectedRoute allowedRoles={['Admin', 'Finance']}><Finance /></ProtectedRoute>},
    {path:"/profile", element:<ProtectedRoute><Profile /></ProtectedRoute>},

  ])
  
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <SidebarProvider>
                <RouterProvider router={router}/>
            </SidebarProvider>
        </AuthProvider>
    </StrictMode>,
  );
