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


  const router =createBrowserRouter ([
    {path: '/',element:<HomePage/>},
    {path:'/Order',element:<Order/>},
    {path:'/Order/CreateOrder',element:<CreateOrderForm/>},
    {path:'/Shipper',element:<Shipper/>},
    {path:'/Shipper/CreateShipper',element:<CreateShipper/>},
    {path:"/Order/:trackingId", element:<OrderDetail />},
    {path:"/Shipper/:shipperId", element:<ShipperDetail />},
    {path:"/Shipper/:shipperId/CreateOrder", element:<CreateOrderForm />},
    {path:"/Route", element:<RoutePage />},
    {path:"/Route/:RouteId", element:<RouteDetail />},
    {path:"/Shipment", element:<ShipmentPage />},
    {path:"/ShipmentDetail/:ShipmentId", element:<ShipmentDetail />},
  ])
  
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SidebarProvider>
            <RouterProvider router={router}/>
        </SidebarProvider>
    </StrictMode>,
  );
