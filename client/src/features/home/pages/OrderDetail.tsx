import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/contentarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getOrder,
  getShipper,
  updateOrderInfo,
  updateOrderStatus,
  type OrderData,
  type ShipperData,
} from "@/api/serviceApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCode } from "@/components/shared-assets/qr-code"; // custom QRCode component based on QRCodeStyling
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
export function OrderDetail() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const { user } = useAuth();
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
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showOrderConfirmDialog, setShowOrderConfirmDialog] = useState(false);
  const [selectedEditField, setSelectedEditField] = useState<
    "CustomerName" | "CustomerContact" | "CustomerAddress" | "Amount" | "Type" | "Note"
  >("CustomerName");
  const [editValue, setEditValue] = useState("");

  const isCancelled = order?.Status === "Cancelled";
  const isDelivered = order?.Status === "Delivered";
  const isFailed = order?.Status === "Failed" || order?.Status === "fail";
  const isReadOnly = isDelivered || isFailed;
  const canEditOrder = user?.role === "Admin" || user?.role === "Finance";
  const statusBgColor =
    isCancelled || isDelivered || isFailed
      ? "bg-white-100"
      : "bg-white";

  const openStatusModal = () => {
    setNewStatus(order?.Status || "");
    setShowModal(true);
  };

  const openEditInfoModal = () => {
    if (!order) return;
    setSelectedEditField("CustomerName");
    setEditValue(order.CustomerName || "");
    setEditError(null);
    setShowEditInfoModal(true);
  };

  const getCurrentFieldValue = (
    field: "CustomerName" | "CustomerContact" | "CustomerAddress" | "Amount" | "Type" | "Note"
  ) => {
    if (!order) return "";
    switch (field) {
      case "CustomerName":
        return order.CustomerName || "";
      case "CustomerContact":
        return String(order.CustomerContact || "");
      case "CustomerAddress":
        return order.CustomerAddress || "";
      case "Amount":
        return String(order.Amount || "");
      case "Type":
        return order.Type || "";
      case "Note":
        return order.Note || "";
      default:
        return "";
    }
  };

  const fieldLabelMap: Record<
    "CustomerName" | "CustomerContact" | "CustomerAddress" | "Amount" | "Type" | "Note",
    string
  > = {
    CustomerName: "Customer Name",
    CustomerContact: "Customer Contact",
    CustomerAddress: "Customer Address",
    Amount: "Amount",
    Type: "Type",
    Note: "Note",
  };

  const handleOrderInfoUpdate = async () => {
    if (!order) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const payload: Partial<
        Pick<OrderData, "CustomerName" | "CustomerContact" | "CustomerAddress" | "Amount" | "Type" | "Note">
      > = {};
      const value = selectedEditField === "Amount" ? Number(editValue) : editValue.trim();
      (payload as any)[selectedEditField] = value;

      const updated = await updateOrderInfo(order.TrackingId, {
        ...payload,
        createdBy: "user",
      });
      setOrder(updated);
      setShowEditInfoModal(false);
    } catch (err) {
      setEditError("Failed to update order information");
    } finally {
      setEditLoading(false);
    }
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
                    {canEditOrder && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={openEditInfoModal}
                          disabled={isReadOnly || isCancelled}
                          className="border-r border-b"
                        >
                          Edit Order Info
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={openStatusModal}
                          disabled={isReadOnly || isCancelled}
                          className="border-r border-b"
                        >
                          Edits
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* QR Code */}
                  {order.TrackingId && (
                    <div className="flex">
                      <QRCode value={order.TrackingId} size="lg" />
                    </div>
                  )}

                    <div className="mt-6">
                      <div className="text-sm text-gray-400">Your order is</div>
                      <div
                        className={
                          `mt-2 text-4xl font-extrabold ` +
                          (order.Status === "Delivered"
                            ? "text-green-600"
                            : order.Status === "Failed" || order.Status === "fail"
                            ? "text-red-600"
                            : "text-gray-900")
                        }
                      >
                        {order.Status || "Unknown"}
                      </div>
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
                  disabled={statusLoading || isReadOnly || isCancelled || !canEditOrder}
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
                    disabled={statusLoading || isReadOnly || isCancelled || !canEditOrder}
                  >
                    <SelectTrigger className="w-full min-h-[44px] text-gray-800 font-semibold shadow-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Hub Inbound">Hub Inbound</SelectItem>
                      <SelectItem value="Add To Shipment">Add To Shipment</SelectItem>
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
                  disabled={statusLoading || isReadOnly}
                />
                <div className="flex gap-3 justify-end">
                  <Button onClick={handleStatusUpdate} disabled={statusLoading || !newStatus || isReadOnly || !canEditOrder}>
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

          {/* Edit Order Info Modal */}
          {showEditInfoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray bg-opacity-30 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-8 relative animate-fade-in">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                  onClick={() => setShowEditInfoModal(false)}
                  aria-label="Close"
                  disabled={editLoading || isReadOnly || isCancelled || !canEditOrder}
                >
                  x
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Order Information</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select field to edit
                  </label>
                  <Select
                    value={selectedEditField}
                    onValueChange={(value) => {
                      const field = value as
                        | "CustomerName"
                        | "CustomerContact"
                        | "CustomerAddress"
                        | "Amount"
                        | "Type"
                        | "Note";
                      setSelectedEditField(field);
                      setEditValue(getCurrentFieldValue(field));
                    }}
                    disabled={editLoading || !canEditOrder}
                  >
                    <SelectTrigger className="w-full min-h-[44px] text-gray-800 font-semibold shadow-sm">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CustomerName">Customer Name</SelectItem>
                      <SelectItem value="CustomerContact">Customer Contact</SelectItem>
                      <SelectItem value="CustomerAddress">Customer Address</SelectItem>
                      <SelectItem value="Amount">Amount</SelectItem>
                      <SelectItem value="Type">Type</SelectItem>
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
                    type={selectedEditField === "Amount" ? "number" : "text"}
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
                    onClick={() => setShowOrderConfirmDialog(true)}
                    disabled={
                      editLoading ||
                      !editValue.trim() ||
                      !canEditOrder ||
                      editValue.trim() === getCurrentFieldValue(selectedEditField).trim()
                    }
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditInfoModal(false)}
                    disabled={editLoading}
                    className="px-6 py-2 font-semibold rounded-lg border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>

                <AlertDialog open={showOrderConfirmDialog} onOpenChange={setShowOrderConfirmDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Order Update</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">{fieldLabelMap[selectedEditField]}</span>
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
                          e.preventDefault();
                          setShowOrderConfirmDialog(false);
                          handleOrderInfoUpdate();
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
  );
}
