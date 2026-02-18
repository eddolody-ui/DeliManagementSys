import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./features/home/pages/HomePage";
import { Order } from "./features/home/pages/Order";
import { OrderDetail } from "./features/home/pages/OrderDetail";
import { CreateOrderForm } from "./features/home/pages/CreateOrder";
import { Shipper } from "./features/home/pages/Shipper";
import { CreateShipper } from "./features/home/pages/CreateShipper";
import { ShipperDetail } from "./features/home/pages/ShipperDetail";
import { RouteDetail } from "./features/home/pages/RouteDetail";
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Toaster } from "sonner";
import { RoutePage } from "./features/home/pages/Route";
import { ShipmentPage } from "./features/home/pages/Shipment";
import { ShipmentDetail } from "./features/home/pages/ShipmentDetail";
import { Finance } from "./features/home/pages/Finical";
import { Profile } from "./features/home/pages/Profile.tsx";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false }; // default state: error မဖြစ်သေး
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }; // render error တက်လျှင် fallback UI mode သို့ပြောင်း
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo); // debug log အတွက်
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">
                  Something went wrong
                </h3>
                <div className="mt-2 text-sm text-gray-700">
                  <p>Please refresh the page or contact support if the problem persists.</p>
                  {this.state.error && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs">Error details</summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()} // reload click -> browser refresh
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; // error မရှိလျှင် app children ပုံမှန် render
  }
}

function App() {
  return (
    <ErrorBoundary>
      {/* app-level runtime error ကို ErrorBoundary နဲ့ဖမ်း */}
      <BrowserRouter>
        {/* React Router context */}
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* root -> dashboard/home page */}
          <Route path="/Order" element={<Order />} /> {/* order list page */}
          <Route path="/Order/CreateOrder" element={<CreateOrderForm />} /> {/* manual create order page */}
          <Route path="/Order/:trackingId" element={<OrderDetail />} /> {/* selected order detail by trackingId */}
          <Route path="/Shipper" element={<Shipper />} /> {/* shipper list page */}
          <Route path="/Shipper/CreateShipper" element={<CreateShipper />} /> {/* create shipper form */}
          <Route path="/Shipper/:shipperId" element={<ShipperDetail />} /> {/* selected shipper detail by shipperId */}
          <Route path="/Shipper/:shipperId/CreateOrder" element={<CreateOrderForm />} /> {/* shipper detail ကနေ order create */}
          <Route path="/Route" element={<RoutePage />} /> {/* route list page */}
          <Route path="/Route/:RouteId" element={<RouteDetail />} /> {/* selected route detail by RouteId */}
          <Route path="/Shipment" element={<ShipmentPage />} /> {/* shipment list page */}
          <Route path="/Shipment/:ShipmentId" element={<ShipmentDetail />} /> {/* selected shipment detail by ShipmentId */}
          <Route path="/Finance/Shipper" element={<Finance />} /> {/* finance role အတွက် shipper page */}
          <Route path="/profile" element={<Profile />} /> {/* current user profile page */}
        </Routes>
        <Toaster richColors /> {/* app-wide toast notification outlet */}
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
