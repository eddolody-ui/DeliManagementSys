import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/contentarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getRoute, type RouteData } from "@/api/serviceApi"
import { ScrollArea } from "@/components/ui/scroll-area"
import type{ OrderData } from "@/api/serviceApi"
import { getOrder } from "@/api/serviceApi"
import { useNavigate } from "react-router-dom";
import { addOrderToRoute } from "@/api/serviceApi";

export function RouteDetail() {
  const navigate = useNavigate();
  const {RouteId } = useParams<{ RouteId: string }>()
  const [route, setRoute] = useState<(RouteData & { _id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User input for trackingId
const [inputTrackingId, setInputTrackingId] = useState("");

// Orders fetched based on input
const [, setFetchedOrders] = useState<
  (OrderData & { _id: string; createdAt: string; updatedAt: string })[]
>([])

  useEffect(() => {
    const fetchRoute = async () => {
      if (!RouteId) {
        setError("No Route ID provided")
        setLoading(false)
        return
      }

      try {
        // Fetch route by RouteId (RouteId may be custom string or Mongo _id)
        const routeData = await getRoute(RouteId)
        console.log("Fetched route data:", routeData)
        setRoute(routeData);

        // Handle shipper data - either populated object or string reference
      } catch (err: any) {
        console.error("Error fetching order:", err)
        if (err.response?.status === 404) {
          setError("Route not found")
        } else if (err.response?.status >= 500) {
          setError("Server error. Please try again later.")
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError("Network error. Please check your connection.")
        } else {
          setError("Failed to load order details")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRoute()
  }, [RouteId])

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading Route details...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-600 mb-4 text-lg">{error}</div>
                <Link to="/Route">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Routes
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  if (!route) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Route not found</p>
                <Link to="/Route">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Routes
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">

          {/* Centered card matching mock: left info | center status + timeline | right actions */}
          <div className="p-6 rounded-lg h-full">
            <div className="max-w-5xl mx-auto overflow-hidden">
              <div className="grid grid-cols-12">
                {/* Left column: customer & seller info (3/12) */}
                <div className="col-span-12 md:col-span-3 border-r px-6 py-8">
                  <div className="mb-6">
                    <div className="text-ms text-gray-400">Name</div>
                    <div className="mt-1 font-medium ">{route.AssignPersonName}</div>
                  </div>
                  <div className="mb-6">
                    <div className="text-ms text-gray-400 ">Hub</div>
                    <div className="mt-1 text-sm text-black-700">{route.Hub ||'—'}</div>
                  </div>
                  <div className="mb-6">
                    <div className="text-ms text-gray-400 ">Amount</div>
                    <div className="mt-1 text-sm text-gray-700">{route.totalAmount || 0} MMK</div>
                  </div>
                  <div className="mb-6">
                    <div className="text-ms text-gray-400 ">Delivery Address</div>
                    <div className="mt-1 text-sm text-gray-700">{'—'}</div>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-ms text-gray-400 ">Shipper</div>
                    <div className="mt-1 text-sm">{'N/A'}</div>
                  </div>
                  <div className="mt-4">
                    <div className="text-ms text-gray-400 ">Shipper Contact</div>
                    <div className="text-sm">{'—'}</div>
                  </div>
                </div>
                {/* Middle column: tracking & status (6/12) */}
                <div className="col-span-12 md:col-span-6 px-8 py-8">
                  <div className="flex items-center mb-6 justify-between w-170">
                    <div className="flex">
                      <div className="font-semibold text-gray-800">RouteID# {route.RouteId}</div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Tracking ID"
                        value={inputTrackingId}
                        onChange={(e) => setInputTrackingId(e.target.value)}
                        className="border rounded px-4 py-2 flex-1"
                      />
                    <Button
                      onClick={async () => {
                        if (!inputTrackingId) return;
                        if (!RouteId) {
                          alert("Route ID missing");
                          return;
                        }

                        try {
                          await addOrderToRoute(RouteId, inputTrackingId);

                          const order = await getOrder(inputTrackingId);
                          setFetchedOrders((prev) => [order, ...prev]);

                          setInputTrackingId("");
                        } catch (err) {
                          console.error(err);
                          alert("Failed to add order");
                        }
                      }}
                    >
                      Add
                    </Button>
                    </div>
                  <div className="grid space-between w-full md:grid-cols-2 gap-6">
                  {/* Tracking History / Timeline */}    
                  <div className="mt-8">
                    <div className="text-sm font-medium mb-4">Route History</div>
                      <ScrollArea className="h-auto border-l p-4">
                        <ul className="space-y-4">
                          {route.log && route.log.length > 0 ? (
                            route.log.map((entry: any, idx: number) => (
                              <li key={idx} className="mb-1 text-xs text-gray-700">
                                <span className="font-bold">{entry.status}</span>
                                {entry.message && <>: {entry.message}</>}
                                {entry.timestamp && (
                                  <span className="ml-2 text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                                )}
                                {entry.createdBy && (
                                  <span className="ml-2 text-gray-400">by {entry.createdBy}</span>
                                )}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-500">No route history yet</li>
                          )}
                        </ul>
                      </ScrollArea>
                  </div>
                  <div className="mt-8">
                    <div className="text-sm font-medium mb-4">Total Order </div>
                      <ScrollArea className="h-64 border-l p-4">
                        <ul className="space-y-4">
                          {route.orders && route.orders.length > 0 ? (
                            route.orders.map((order: any) => (
                              <li key={order._id} onClick={() => navigate(`/order/${order.TrackingId}`)}
                              className="p-2 border-l flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-gray-800">{order.CustomerName}</div>
                                  <div className="text-sm text-gray-500">Tracking ID: {order.TrackingId}</div>
                                  <div className="text-sm text-gray-500">Amount: {order.Amount}</div>
                                  <div className="text-sm text-gray-500">Status: {order.Status}</div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-500">No orders in this route</li>
                          )}
                        </ul>
                      </ScrollArea>
                    </div>         
                    </div>               
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>

  )
}