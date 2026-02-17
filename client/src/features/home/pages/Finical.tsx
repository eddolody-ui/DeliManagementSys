import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNavbar } from "@/components/contentarea"
import { getOrders, getShippers, updateOrderStatus, type OrderData, type ShipperData } from "@/api/serviceApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Shipper = ShipperData & { _id: string }
type Order = OrderData & { _id: string; createdAt: string; updatedAt: string }

const isCompletedStatus = (status: string | undefined) => {
  const normalized = (status || "").trim().toLowerCase()
  return normalized === "completed" || normalized === "delivered"
}

const getOrderShipperKeys = (order: Order): string[] => {
  if (!order.shipperId) return []

  if (typeof order.shipperId === "string") {
    return [order.shipperId]
  }

  const keys: string[] = []
  if (order.shipperId._id) keys.push(order.shipperId._id)
  if (order.shipperId.ShipperId) keys.push(order.shipperId.ShipperId)
  return keys
}

const formatAmount = (amount: number) => `${new Intl.NumberFormat("en-US").format(amount || 0)} MMK`

export function Finance() {
  const [loading, setLoading] = React.useState(true)
  const [shippers, setShippers] = React.useState<Shipper[]>([])
  const [orders, setOrders] = React.useState<Order[]>([])
  const [selectedShipperId, setSelectedShipperId] = React.useState("")
  const [selectedOrderIds, setSelectedOrderIds] = React.useState<string[]>([])
  const [showSlip, setShowSlip] = React.useState(false)
  const [isSlipConfirmed, setIsSlipConfirmed] = React.useState(false)
  const [confirmedAt, setConfirmedAt] = React.useState("")
  const [confirmingPayment, setConfirmingPayment] = React.useState(false)

  React.useEffect(() => {
    const loadFinanceData = async () => {
      try {
        const [shippersRes, ordersRes] = await Promise.all([getShippers(), getOrders()])
        setShippers(shippersRes as Shipper[])
        setOrders(ordersRes as Order[])
      } catch (error) {
        console.error("Failed to load finance data:", error)
        setShippers([])
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadFinanceData()
  }, [])

  const selectedShipper = React.useMemo(
    () => shippers.find((shipper) => shipper._id === selectedShipperId),
    [shippers, selectedShipperId]
  )

  const completedOrdersForShipper = React.useMemo(() => {
    if (!selectedShipper) return []

    const validKeys = new Set([selectedShipper._id, selectedShipper.ShipperId].filter(Boolean))

    return orders.filter((order) => {
      const orderKeys = getOrderShipperKeys(order)
      return isCompletedStatus(order.Status) && orderKeys.some((key) => validKeys.has(key))
    })
  }, [orders, selectedShipper])

  const selectedOrders = React.useMemo(
    () => completedOrdersForShipper.filter((order) => selectedOrderIds.includes(order._id)),
    [completedOrdersForShipper, selectedOrderIds]
  )

  const totalAmount = React.useMemo(
    () => selectedOrders.reduce((sum, order) => sum + (order.Amount || 0), 0),
    [selectedOrders]
  )

  const isAllChecked =
    completedOrdersForShipper.length > 0 && selectedOrderIds.length === completedOrdersForShipper.length

  const onShipperChange = (value: string) => {
    setSelectedShipperId(value)
    setSelectedOrderIds([])
    setShowSlip(false)
    setIsSlipConfirmed(false)
    setConfirmedAt("")
  }

  const onToggleAll = (checked: boolean) => {
    setIsSlipConfirmed(false)
    setConfirmedAt("")
    if (checked) {
      setSelectedOrderIds(completedOrdersForShipper.map((order) => order._id))
      return
    }
    setSelectedOrderIds([])
  }

  const onToggleOrder = (orderId: string, checked: boolean) => {
    setIsSlipConfirmed(false)
    setConfirmedAt("")
    if (checked) {
      setSelectedOrderIds((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]))
      return
    }

    setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId))
  }

  const onConfirmSlip = async () => {
    if (selectedOrders.length === 0 || confirmingPayment) return

    setConfirmingPayment(true)
    try {
      await Promise.all(
        selectedOrders.map((order) =>
          updateOrderStatus(
            order.TrackingId,
            "Payment Occupied",
            "Payment completed and marked as occupied",
            "finance"
          )
        )
      )

      const selectedOrderIdSet = new Set(selectedOrders.map((order) => order._id))
      setOrders((prev) =>
        prev.map((order) =>
          selectedOrderIdSet.has(order._id) ? { ...order, Status: "Payment Occupied" } : order
        )
      )
      setIsSlipConfirmed(true)
      setConfirmedAt(new Date().toLocaleString())
    } catch (error) {
      console.error("Failed to complete payment:", error)
    } finally {
      setConfirmingPayment(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <SidebarInset className="flex flex-col w-full">
          <TopNavbar />

          <div className="p-4 space-y-4">
            <Card className="rounded border">
              <CardHeader>
                <CardTitle className="text-lg">Create Finance Slip</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 max-w-sm">
                  <label className="text-sm font-medium">Select Shipper</label>
                  <Select value={selectedShipperId} onValueChange={onShipperChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose shipper" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippers.map((shipper) => (
                        <SelectItem key={shipper._id} value={shipper._id}>
                          {shipper.ShipperName} ({shipper.ShipperId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loading && <p className="text-sm text-gray-500">Loading shippers and orders...</p>}

                {!loading && selectedShipper && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-700">
                      Completed orders for <span className="font-semibold">{selectedShipper.ShipperName}</span>
                    </div>

                    <div className="overflow-hidden rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={isAllChecked}
                                onCheckedChange={(checked) => onToggleAll(Boolean(checked))}
                              />
                            </TableHead>
                            <TableHead>Tracking ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedOrdersForShipper.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                                No completed orders for this shipper.
                              </TableCell>
                            </TableRow>
                          ) : (
                            completedOrdersForShipper.map((order) => {
                              const checked = selectedOrderIds.includes(order._id)

                              return (
                                <TableRow key={order._id}>
                                  <TableCell>
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(next) => onToggleOrder(order._id, Boolean(next))}
                                    />
                                  </TableCell>
                                  <TableCell>{order.TrackingId}</TableCell>
                                  <TableCell>{order.CustomerName}</TableCell>
                                  <TableCell>{order.Status}</TableCell>
                                  <TableCell className="text-right">{formatAmount(order.Amount)}</TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => setShowSlip(true)}
                        disabled={selectedOrderIds.length === 0}
                      >
                        Generate Slip
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedOrderIds([])
                          setShowSlip(false)
                          setIsSlipConfirmed(false)
                          setConfirmedAt("")
                        }}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {showSlip && selectedShipper && selectedOrders.length > 0 && (
              <Card className="rounded border" id="finance-slip">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg">Finance Slip</CardTitle>
                  <p className="text-sm text-gray-600">
                    Shipper: {selectedShipper.ShipperName} ({selectedShipper.ShipperId})
                  </p>
                  <p className="text-sm text-gray-600">
                    Slip Date: {new Date().toLocaleDateString()}
                  </p>
                  {isSlipConfirmed && (
                    <p className="text-sm font-semibold text-green-700">
                      Slip Confirmed {confirmedAt ? `at ${confirmedAt}` : ""}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="overflow-hidden rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tracking ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>{order.TrackingId}</TableCell>
                            <TableCell>{order.CustomerName}</TableCell>
                            <TableCell>{order.Status}</TableCell>
                            <TableCell className="text-right">{formatAmount(order.Amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="font-semibold">Total Selected Orders: {selectedOrders.length}</span>
                    <span className="font-semibold">Total Amount: {formatAmount(totalAmount)}</span>
                  </div>

                  <div>
                    <Button
                      className="mr-2"
                      onClick={onConfirmSlip}
                      disabled={isSlipConfirmed || confirmingPayment}
                    >
                      {isSlipConfirmed ? "Slip Confirmed" : confirmingPayment ? "Confirming..." : "Confirm Slip"}
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                      Print Slip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
