import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/contentarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getOrder,
  getShipper,
  updateOrderStatus,
  type OrderData,
  type ShipperData,
} from "@/api/serviceApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCode } from "@/components/shared-assets/qr-code"; // custom QRCode component based on QRCodeStyling
export function OrderDetail() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [order, setOrder] = useState<(OrderData & { _id: string; createdAt: string; updatedAt: string }) | null>(null);
  const [shipper, setShipper] = useState<(ShipperData & { _id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal and status update state
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [changeReason, setChangeReason] = useState("");

  const isCancelled = order?.Status === "Cancelled";
  const statusBgColor =
    order?.Status === "Cancelled"
      ? "bg-white-100"
      : order?.Status === "Delivered"
      ? "bg-white-100"
      : "bg-white";

  const openStatusModal = () => {
    setNewStatus(order?.Status || "");
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;
    setStatusLoading(true);
    setStatusError(null);
    try {
      const message = changeReason.trim() ? changeReason : `Status changed to ${newStatus}`;
      await updateOrderStatus(order.TrackingId, newStatus, message, "user");
      const updatedOrder = await getOrder(order.TrackingId);
      setOrder(updatedOrder);
      setShowModal(false);
      setChangeReason("");
    } catch (err: any) {
      setStatusError("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!trackingId) {
        setError("No tracking ID provided");
        setLoading(false);
        return;
      }
      try {
        const orderData = await getOrder(trackingId);
        setOrder(orderData);

        if (orderData.shipperId) {
          if (typeof orderData.shipperId === "object" && orderData.shipperId !== null) {
            setShipper(orderData.shipperId as ShipperData & { _id: string });
          } else if (typeof orderData.shipperId === "string") {
            try {
              const shipperData = await getShipper(orderData.shipperId);
              setShipper(shipperData);
            } catch (shipperError) {
              console.error("Error fetching shipper:", shipperError);
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        if (err.response?.status === 404) setError("Order not found");
        else if (err.response?.status >= 500) setError("Server error. Please try again later.");
        else if (err.code === "NETWORK_ERROR" || !err.response) setError("Network error. Please check your connection.");
        else setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [trackingId]);

  if (loading)
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading order details...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );

  if (error)
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-600 mb-4 text-lg">{error}</div>
                <Link to="/Order">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );

  if (!order)
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col w-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Order not found</p>
                <Link to="/Order">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">
          <div className={`p-6 rounded-lg h-full ${statusBgColor}`}>
            <div className="max-w-5xl mx-auto overflow-hidden">
              <div className="grid grid-cols-9 gap-10">
                {/* Left column */}
                <div className="col-span-12 md:col-span-3 border-r px-6 py-8 space-y-4">
                  <div>
                    <div className="text-ms text-gray-400">Customer Name</div>
                    <div className="mt-1 font-medium">{order.CustomerName || "—"}</div>
                  </div>
                  <div>
                    <div className="text-ms text-gray-400">Customer Contact</div>
                    <div className="mt-1 text-sm text-gray-700">{order.CustomerContact || "—"}</div>
                  </div>
                  <div>
                    <div className="text-ms text-gray-400">Amount</div>
                    <div className="mt-1 text-sm text-gray-700">{order.Amount || "—"}</div>
                  </div>
                  <div>
                    <div className="text-ms text-gray-400">Delivery Address</div>
                    <div className="mt-1 text-sm text-gray-700">{order.CustomerAddress || "—"}</div>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-ms text-gray-400">Shipper</div>
                    <div className="mt-1 text-sm">{shipper?.ShipperName || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-ms text-gray-400">Shipper Contact</div>
                    <div className="mt-1 text-sm">{shipper?.ShipperContact || "—"}</div>
                  </div>
                </div>

                {/* Middle column: tracking, status & QR */}
                <div className="col-span-12 md:col-span-6 px-8 py-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-gray-800">Tracking ID #{order.TrackingId}</div>
                    <Button variant="ghost" onClick={openStatusModal} disabled={isCancelled}>
                      Update Status
                    </Button>
                  </div>

                  {/* QR Code */}
                  {order.TrackingId && (
                    <div className="flex">
                      <QRCode value={order.TrackingId} size="lg" />
                    </div>
                  )}

                  <div className="mt-6">
                    <div className="text-sm text-gray-400">Your order is</div>
                    <div className="mt-2 text-4xl font-extrabold text-gray-900">{order.Status || "Unknown"}</div>
                    <div className="mt-2 text-sm text-gray-500">
                      {order.Status === "Delivered" && order.updatedAt ? `as on ${new Date(order.updatedAt).toLocaleDateString()}` : ""}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Last updated on {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : "—"}
                    </div>
                  </div>

                  {/* Tracking History */}
                  <div>
                    <div className="text-sm font-medium mb-2">Tracking History</div>
                    <ScrollArea className="h-64 rounded-md border-l p-4">
                      <ul className="space-y-4">
                        {order.log && order.log.length > 0 ? (
                          order.log.slice().reverse().map((entry, idx) => (
                            <li key={idx} className="relative">
                              <div className="text-sm font-medium">{entry.status || "Event"}</div>
                              <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}
                                {entry.message && <span className="ml-2 text-blue-500 font-medium">{entry.message}</span>}
                              </div>
                              <Separator className="my-2" />
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">No tracking events available.</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray bg-opacity-30 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 relative animate-fade-in">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                  disabled={statusLoading || isCancelled}
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Update Order Status</h2>
                <div className="mb-6">
                  <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select new status
                  </label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) => setNewStatus(value)}
                    disabled={statusLoading || isCancelled}
                  >
                    <SelectTrigger className="w-full min-h-[44px] text-gray-800 font-semibold shadow-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Hub Inbound">Hub Inbound</SelectItem>
                      <SelectItem value="Arrive At Softing Hub">Arrive At Softing Hub</SelectItem>
                      <SelectItem value="In Route">In Route</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Return To Sender">Return To Sender</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {statusError && <div className="text-red-600 mb-4 text-sm">{statusError}</div>}
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 hover:bg-blue-50"
                  rows={3}
                  placeholder="Changed Reason"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  disabled={statusLoading}
                />
                <div className="flex gap-3 justify-end">
                  <Button onClick={handleStatusUpdate} disabled={statusLoading || !newStatus}>
                    {statusLoading ? "Updating..." : "Update"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={statusLoading}
                    className="px-6 py-2 font-semibold rounded-lg border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}