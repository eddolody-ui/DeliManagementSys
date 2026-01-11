import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/contentarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getRoute, type OrderData, type RouteData } from "@/api/serviceApi"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

export function RouteDetail() {
  const {RouteId } = useParams<{ RouteId: string }>()
  const [route, setRoute] = useState<(RouteData & { _id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal and status update state
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading] = useState(false);
  const [statusError] = useState<string | null>(null);
  const [changeReason, setChangeReason] = useState("");

  // Update newStatus when modal opens
  const openStatusModal = () => {
    setShowModal(true);
  };

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
        setRoute(routeData)

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
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}