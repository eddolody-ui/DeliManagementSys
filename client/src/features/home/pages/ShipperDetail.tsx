import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EachShipperData, AppSidebar, TopNavbar } from "@/components/contentarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getOrders, getShipper, updateShipper, type OrderData, type ShipperData } from "@/api/serviceApi"
import { CardTitle } from "@/components/ui/card"
import { OrderDataTable } from "@/components/DataTable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ShipperDetail() {
  const { shipperId } = useParams<{ shipperId: string }>()
  const [shipper, setShipper] = useState<(ShipperData & { _id: string }) | null>(null)
  const [orders, setOrders] = useState<(OrderData & { _id: string; createdAt: string; updatedAt: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [showShipperConfirmDialog, setShowShipperConfirmDialog] = useState(false)
  const [selectedEditField, setSelectedEditField] = useState<
    "ShipperName" | "ShipperContact" | "ShipperAddress" | "PickUpAddress" | "BillingType" | "Note"
  >("ShipperName")
  const [editValue, setEditValue] = useState("")

  const openEditModal = () => {
    if (!shipper) return
    setSelectedEditField("ShipperName")
    setEditValue(shipper.ShipperName || "")
    setEditError(null)
    setShowEditModal(true)
  }

  const getCurrentFieldValue = (
    field: "ShipperName" | "ShipperContact" | "ShipperAddress" | "PickUpAddress" | "BillingType" | "Note"
  ) => {
    if (!shipper) return ""
    switch (field) {
      case "ShipperName":
        return shipper.ShipperName || ""
      case "ShipperContact":
        return String(shipper.ShipperContact || "")
      case "ShipperAddress":
        return shipper.ShipperAddress || ""
      case "PickUpAddress":
        return shipper.PickUpAddress || ""
      case "BillingType":
        return shipper.BillingType || ""
      case "Note":
        return shipper.Note || ""
      default:
        return ""
    }
  }

  const shipperFieldLabelMap: Record<
    "ShipperName" | "ShipperContact" | "ShipperAddress" | "PickUpAddress" | "BillingType" | "Note",
    string
  > = {
    ShipperName: "Shipper Name",
    ShipperContact: "Shipper Contact",
    ShipperAddress: "Shipper Address",
    PickUpAddress: "Pick Up Address",
    BillingType: "Billing Type",
    Note: "Note",
  }

  const handleSaveShipperInfo = async () => {
    if (!shipperId) return
    setEditLoading(true)
    setEditError(null)
    try {
      const payload: Partial<
        Pick<ShipperData, "ShipperName" | "ShipperContact" | "ShipperAddress" | "PickUpAddress" | "BillingType" | "Note">
      > = {}
      ;(payload as any)[selectedEditField] = editValue.trim()

      const updated = await updateShipper(shipperId, {
        ...payload,
      })
      setShipper(updated)
      setShowEditModal(false)
    } catch (err) {
      setEditError("Failed to update shipper information")
    } finally {
      setEditLoading(false)
    }
  }

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
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="ghost"
                  className="rounded border-b transform motion-safe:hover:scale-110 transition-transform"
                  onClick={openEditModal}
                >
                  Edit Shipper Info
                </Button>
                <Link to={`/Shipper/${shipperId}/CreateOrder`}>
                  <Button  variant="ghost" className="rounded border-b transform motion-safe:hover:scale-110 transition-transform">
                    Create Order
                  </Button>
                </Link>
              </div>
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

          {showEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray bg-opacity-30 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-8 relative animate-fade-in">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close"
                  disabled={editLoading}
                >
                  x
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Shipper Information</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select field to edit
                  </label>
                  <Select
                    value={selectedEditField}
                    onValueChange={(value) => {
                      const field = value as
                        | "ShipperName"
                        | "ShipperContact"
                        | "ShipperAddress"
                        | "PickUpAddress"
                        | "BillingType"
                        | "Note"
                      setSelectedEditField(field)
                      setEditValue(getCurrentFieldValue(field))
                    }}
                    disabled={editLoading}
                  >
                    <SelectTrigger className="w-full min-h-[44px] text-gray-800 font-semibold shadow-sm">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ShipperName">Shipper Name</SelectItem>
                      <SelectItem value="ShipperContact">Shipper Contact</SelectItem>
                      <SelectItem value="ShipperAddress">Shipper Address</SelectItem>
                      <SelectItem value="PickUpAddress">Pick Up Address</SelectItem>
                      <SelectItem value="BillingType">Billing Type</SelectItem>
                      <SelectItem value="Note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedEditField === "Note" ? (
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6"
                    rows={4}
                    placeholder="Enter note"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    disabled={editLoading}
                  />
                ) : (
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6"
                    placeholder={`Enter ${selectedEditField}`}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    disabled={editLoading}
                  />
                )}
                {editError && <div className="text-red-600 mb-4 text-sm">{editError}</div>}
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowShipperConfirmDialog(true)}
                    disabled={
                      editLoading ||
                      !editValue.trim() ||
                      editValue.trim() === getCurrentFieldValue(selectedEditField).trim()
                    }
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    disabled={editLoading}
                    className="px-6 py-2 font-semibold rounded-lg border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>

                <AlertDialog open={showShipperConfirmDialog} onOpenChange={setShowShipperConfirmDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Shipper Update</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">{shipperFieldLabelMap[selectedEditField]}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Current:</span>{" "}
                            <span className="font-medium">{getCurrentFieldValue(selectedEditField) || "-"}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Want to change:</span>{" "}
                            <span className="font-medium">{editValue || "-"}</span>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={editLoading}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault()
                          setShowShipperConfirmDialog(false)
                          handleSaveShipperInfo()
                        }}
                        disabled={editLoading}
                      >
                        Confirm Change
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
