import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/contentarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { addOrderToShipment, getShipment, type ShipmentData } from "@/api/serviceApi"
import { ScrollArea } from "@/components/ui/scroll-area"
import type{ OrderData } from "@/api/serviceApi"
import { getOrder } from "@/api/serviceApi"
import { useNavigate } from "react-router-dom";

export function ShipmentDetail() {
  const navigate = useNavigate();
  const {ShipmentId } = useParams<{ ShipmentId: string }>()
  const [shipment, setshipment] = useState<(ShipmentData & { _id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User input for trackingId
const [inputTrackingId, setInputTrackingId] = useState("");

// Orders fetched based on input
const [, setFetchedOrders] = useState<
  (OrderData & { _id: string; createdAt: string; updatedAt: string })[]
>([])

  useEffect(() => {
    const fetchShipment = async () => {
      if (!ShipmentId) {
        setError("No Shipment ID provided")
        setLoading(false)
        return
      }

      try {
        // Fetch route by RouteId (RouteId may be custom string or Mongo _id)
        const shipmentData = await getShipment(ShipmentId)
        console.log("Fetched route data:", shipmentData)
        setshipment(shipmentData);

        // Handle shipper data - either populated object or string reference
      } catch (err: any) {
        console.error("Error fetching Shipment:", err)
        if (err.response?.status === 404) {
          setError("Shipment not found")
        } else if (err.response?.status >= 500) {
          setError("Server error. Please try again later.")
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError("Network error. Please check your connection.")
        } else {
          setError("Failed to load Shipment details")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchShipment()
  }, [ShipmentId])

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading Shipment details...</p>
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
                <Link to="/Shipment">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shipment
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  if (!shipment) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Shipment not found</p>
                <Link to="/Route">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shipment
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
                    <div className="text-ms text-gray-400 ">From</div>
                    <div className="mt-1 text-sm text-black-700">{shipment.FromHub ||'—'}</div>
                  </div>
                  <div className="mb-6">
                    <div className="text-ms text-gray-400 ">To</div>
                    <div className="mt-1 text-sm text-gray-700">{shipment.ToHub || 0} MMK</div>
                  </div>
                  <div className="mb-6">
                    <div className="text-ms text-gray-400 ">Total Order In Shipment</div>
                    <div className="mt-1 text-sm text-gray-700">{shipment.orders ? shipment.orders.length : 0}</div>
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
                      <div className="font-semibold text-gray-800">Shipment ID# {shipment.ShipmentId}</div>
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
                    <Button className="h-10 rounded border-b ml-auto 
                    transform motion-safe:hover:scale-110 transition-transform bg-gray-400
                     hover:bg-gray-700"
                      onClick={async () => {
                        if (!inputTrackingId) return;
                        if (!ShipmentId) {
                          alert("Tracking ID missing");
                          return;
                        }

                        try {
                          await addOrderToShipment(ShipmentId, inputTrackingId);

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
                          {shipment.log && shipment.log.length > 0 ? (
                            shipment.log.map((entry: any, idx: number) => (
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
                          {shipment.orders && shipment.orders.length > 0 ? (
                            shipment.orders.map((order: any) => (
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