import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EachShipperData, AppSidebar, TopNavbar } from "@/components/contentarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getOrders, getShipper, type OrderData, type ShipperData } from "@/api/serviceApi"
import { CardTitle } from "@/components/ui/card"
import { OrderDataTable } from "@/components/DataTable"

export function ShipperDetail() {
  const { shipperId } = useParams<{ shipperId: string }>()
  const [shipper, setShipper] = useState<(ShipperData & { _id: string }) | null>(null)
  const [orders, setOrders] = useState<(OrderData & { _id: string; createdAt: string; updatedAt: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShipperData = async () => {
      if (!shipperId) {
        setError("No shipper ID provided")
        setLoading(false)
        return
      }

      try {
        // Fetch shipper details
        const shipperData = await getShipper(shipperId)
        setShipper(shipperData)

        // Fetch all orders and filter by shipper
        const allOrders = await getOrders() as (OrderData & { _id: string; createdAt: string; updatedAt: string })[]
        const shipperOrders = allOrders.filter(order => {
          if (typeof order.shipperId === 'string') {
            return order.shipperId === shipperId
          } else if (typeof order.shipperId === 'object' && order.shipperId) {
            const shipperObj = order.shipperId as { ShipperId?: string; _id?: string }
            return shipperObj.ShipperId === shipperId || shipperObj._id === shipperId
          }
          return false
        })
        setOrders(shipperOrders)
      } catch (err: unknown) {
        console.error("Error fetching shipper data:", err)
        const error = err as { response?: { status?: number; data?: any }; code?: string; message?: string }

        if (error.response?.status === 404) {
          setError("Shipper not found")
        } else if (error.response?.status && error.response.status >= 500) {
          setError("Server error. Please try again later.")
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          setError("Network error. Please check your connection.")
        } else {
          setError("Failed to load shipper details")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchShipperData()
  }, [shipperId])

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <div className="p-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
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
            <TopNavbar />
            <div className="p-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Link to="/Shipper">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shippers
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  if (!shipper) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <TopNavbar />
            <div className="p-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-600 mb-4">Shipper Not Found</h2>
                <Link to="/Shipper">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shippers
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
            <div className="pl-2 pr-4 mt-3 flex justify-between items-center">
              <Link to="/Shipper">
              </Link>
              <Link to={`/Shipper/${shipperId}/CreateOrder`}>
                <Button  variant="ghost" className="rounded border-b ml-auto transform motion-safe:hover:scale-110 transition-transform">
                  Create Order
                </Button>
              </Link>
            </div>
          <div className="p-3">
          <EachShipperData shipperId={shipperId} />
          </div>
          <div className="p-3">
            {/* Orders by this Shipper */}
                <CardTitle>Orders by {shipper.ShipperName}</CardTitle>
                {orders.length > 0 ? (
                  <OrderDataTable orders={orders} />
                ) : (
                  <div className="text-center">
                    <p className="text-gray-500">No orders found for this shipper.</p>
                  </div>
                )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}