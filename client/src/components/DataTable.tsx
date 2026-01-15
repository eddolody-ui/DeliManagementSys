/**
 * File: DataTable.tsx
 * ရည်ရွယ်ချက်
 * - Orders နဲ့ Shippers အတွက် reusable table components တွေကို ထိန်းကျောင်းပေးပါသည်။
 * - API မှ data ကို fetch → 필요 ပေါင်းစည်း (orders နှင့် shippers) → client-side search/filtering, sorting, pagination တို့ကို
 *   TanStack Table (`useReactTable`) ဖြင့် ထိန်းချုပ်ကာ UI မှာ ပြသသည်။
 * 
 * အဓိက exportများ
 * - `OrderDataTable` : Orders အတွက် table component
 * - `ShipperDataTable`: Shippers အတွက် table component
 * - `columns`, `shipperColumns`: TanStack Table သုံး column definitions
 * - `Order`, `Shipper` types
 */
import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrders, getRoutes, getShippers, type OrderData, type RouteData, type ShipperData } from "@/api/serviceApi"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate, useSearchParams } from "react-router-dom"

export type Order = OrderData & { _id: string; createdAt: string; updatedAt: string };
export type Shipper = ShipperData & { _id: string; createdAt: string; updatedAt: string };
export type DeliRoute = RouteData & { _id: string; createdAt: string; updatedAt: string };

export const shipperColumns: ColumnDef<Shipper>[] = [
  // `shipperColumns` ဆိုတာ Shipper table အတွက် column definitions ဖြစ်တယ်။
  // Each object က TanStack Table ကို header နဲ့ cell rendering ကို ပြောပြပေးတယ်။
  {
    accessorKey: "ShipperId",
    header: () => <div className="flex justify-center">Shipper ID</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("ShipperId")}</div>
    ),
  },
  {
    accessorKey: "ShipperName",
    header: () => <div className="flex justify-center">Shipper Name</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("ShipperName")}</div>
    ),
  },
  {
    accessorKey: "ShipperContact",
    header: () => <div className="flex justify-center">Contact</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("ShipperContact")}</div>
    ),
  },
  {
    accessorKey: "ShipperAddress",
    header: () => <div className="flex justify-center">Address</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("ShipperAddress")}</div>
    ),
  },
  {
    accessorKey: "PickUpAddress",
    header: () => <div className="flex justify-center">Pick Up Address</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("PickUpAddress")}</div>
    ),
  },
  {
    accessorKey: "BillingType",
    header: () => <div className="flex justify-center">Billing Type</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("BillingType")}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="flex justify-center">Date Created</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt")).toLocaleDateString();
      return <div className="capitalize flex justify-center">{date}</div>
    },
  },
]

export const columns: ColumnDef<Order>[] = [
  // `columns` ဆိုတာ Order table အတွက် column definitions ဖြစ်ပြီး
  // tracking id, customer, amount, date စတာတွေကို rendering ပြုလုပ်ပေးသည်။
  {
    accessorKey: "shipperId",
    header: () => <div className="flex justify-center">Shipper ID</div>,
    cell: ({ row }) => {
      return <div className="capitalize flex justify-center">{row.getValue("shipperId")}</div>
    },
  },
  {
    accessorKey: "TrackingId",
    header: () => <div className="flex justify-center">Tracking ID</div>,
    cell: ({ row }) => (
      <div className="capitalize justify-center flex">{row.getValue("TrackingId")}</div>
    ),
  },
  {
    accessorKey: "CustomerName",
    header: () => <div className="flex justify-center">Customer Name</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("CustomerName")}</div>
    ),
  },
  {
    accessorKey: "CustomerContact",
    header: () => <div className="flex justify-center">Contact</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("CustomerContact")}</div>
    ),
  },
  {
    accessorKey: "CustomerAddress",
    header: () => <div className="flex justify-center">Address</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("CustomerAddress")}</div>
    ),
  },
  {
    accessorKey: "Type",
    header: () => <div className="flex justify-center">Type</div>,
    cell: ({ row }) => (
      <div className="capitalize flex justify-center">{row.getValue("Type")}</div>
    ),
  },
  {
    accessorKey: "Amount",
    header: () => <div className="flex justify-center">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("Amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="flex justify-center">{formatted}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="flex justify-center">Date</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt")).toLocaleDateString();
      return <div className="capitalize flex justify-center">{date}</div>
    },
  },
]

export const RouteColumns: ColumnDef<DeliRoute>[] = [
  {
    accessorKey: "RouteId",
    header: () => <div className="flex justify-center">Route ID</div>,
    cell: ({ row }) => {
      return <div className="capitalize flex justify-center">{row.getValue("RouteId")}</div>
    },
  },
  {
    accessorKey: "AssignPersonName",
    header: () => <div className="flex justify-center">Assign Person</div>,
    cell: ({ row }) => {
      return <div className="capitalize flex justify-center">{row.getValue("AssignPersonName")}</div>
    },
  },
  {
    accessorKey: "Process",
    header: () => <div className="flex justify-center">Process</div>,
    cell: ({ row }) => {
      return <div className="capitalize flex justify-center">{row.getValue("Process")}</div>
    },
  },
  {
    accessorKey: "TotalPercel",
    header: () => <div className="flex justify-center">Total Parcel</div>,
    cell: ({ row }) => {
      // Try to read success/fail counts if available on the route object
      const total = Number(row.getValue("TotalPercel") || 0)
      const orig: any = row.original as any
      const success = Number(orig.SuccessfulPercel ?? orig.success ?? orig.Success ?? total)
      const fail = Number(orig.FailedPercel ?? orig.fail ?? orig.Failed ?? Math.max(0, total - success))

      const safeTotal = Math.max(0, total || success + fail)

      const pctSuccess = safeTotal > 0 ? Math.round((success / safeTotal) * 100) : 0
      const pctFail = safeTotal > 0 ? Math.round((fail / safeTotal) * 100) : 0

      return (
        <div className="flex flex-col items-center">
          <div className="w-40 h-4 bg-gray-200 rounded overflow-hidden flex">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${pctSuccess}%` }}
              title={`Success: ${success}`}
            />
            <div
              className="h-full bg-rose-500"
              style={{ width: `${pctFail}%` }}
              title={`Fail: ${fail}`}
            />
          </div>
          <div className="text-xs text-gray-600 mt-1">{success} / {safeTotal} ({pctSuccess}% success)</div>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="flex justify-center">Date Created</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt")).toLocaleDateString();
      return <div className="capitalize flex justify-center">{date}</div>
    },
  },

]

function TableSkeleton({ columns }: { columns: number }) {
  // TableSkeleton: loading state အတွင်းမှာ ဗလာ placeholder rows/header များကို ပြရန် component
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function RouteDataTable({ Routes }: { Routes?: DeliRoute[] } = {}) {
  // RouteDataTable
  // - API မှ `getOrders()` ကို call ပြီး orders ကိုယူသည်။
  // - တကယ်ရှိရင် `getShippers()` နဲ့ merge လုပ်၍ shipper info ကို order နှင့် ပေါင်းစပ်ပေးသည်။
  // - URL query param `q` (search) ကို `useSearchParams` ကနေ ဖတ်ပြီး client-side filter လုပ်ပေးတယ်။
  // - `useReactTable` ကိုသုံးပြီး sorting/filtering/pagination စတာတွေကို ထိန်းချုပ်ပေးတယ်။
  // - row click မှာ `useNavigate` နဲ့ order detail page သို့ ပြောင်းပေးတယ်။
  const navigate = useNavigate()
  const [data, setData] = React.useState<DeliRoute[]>([]);
  const [allData, setAllData] = React.useState<DeliRoute[]>([]);
  const [loading, setLoading] = React.useState(!Routes);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    if (Routes) {
      setData(Routes);
      setAllData(Routes);
      setLoading(false);
      return;
    }

    const fetchRoute = async () => {
      try {
        const fetched = await getRoutes();
        const routesArr = (fetched || []) as DeliRoute[];

        // No complex merge needed for routes currently; use fetched array directly
        setData(routesArr);
        setAllData(routesArr);
      } catch (error) {
        console.error("Failed to fetch Route:", error);
        setData([]);
        setAllData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, []);

  const [searchParams] = useSearchParams();
  React.useEffect(() => {
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    if (!q) {
      setData(allData)
      return
    }

    const filtered = allData.filter((o) => {
      const tracking = (o.RouteId || '').toString().toLowerCase()
      const orderId = (o._id || '').toString().toLowerCase()
      const AssignPersonName = (o.AssignPersonName || '').toString().toLowerCase()
      const identifier = (((o as any).routeIdentifier) || (o.RouteId) || (o._id) || '').toString().toLowerCase()

      return (
        tracking.includes(q) ||
        orderId.includes(q) ||
        AssignPersonName.includes(q) ||
        identifier.includes(q)
      )
    })

    setData(filtered)
  }, [searchParams, allData])

  const table = useReactTable({
    data,
    columns: RouteColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })    

  if (loading) {
    return <TableSkeleton columns={RouteColumns.length} />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4"></div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/Route/${row.original.RouteId}`);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={RouteColumns.length}
                  className="h-24 text-center"
                >
                  No route found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function ShipperDataTable() {
  // ShipperDataTable
  // - `getShippers()` ကနေ shipper စာရင်းကို fetch လုပ်ပြီး
  // - search (`q`) နဲ့ filter လုပ်ပေးသည်၊ TanStack Table နဲ့ rendering ပြုလုပ်သည်။
  // - row click မှာ shipper detail သို့ navigate လုပ်ပေးသည်။
  const navigate = useNavigate()
  const [data, setData] = React.useState<Shipper[]>([]);
  const [allData, setAllData] = React.useState<Shipper[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "ShipperName",
      desc: false,
    },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  React.useEffect(() => {
    const fetchShipper = async () => {
      try {
        let shipper: Shipper[] = []
        try {
          shipper = await getShippers() as Shipper[]
        } catch (err) {
          console.warn('Failed to fetch shippers for merge:', err)
        }

        const shipperById = new Map<string, Shipper>()
        for (const s of shipper) {
          if ((s as any).ShipperId) shipperById.set((s as any).ShipperId.toString(), s)
          if (s._id) shipperById.set(s._id.toString(), s)
        }

        const merged = (shipper as Shipper[]).map((o) => {
          const copy = { ...o } as any
          if (copy.shipperId && typeof copy.shipperId === 'string') {
            const s = shipperById.get(copy.shipperId)
            if (s) copy.shipper = s
          } else if (copy.shipperId && typeof copy.shipperId === 'object') {
            copy.shipper = copy.shipperId
          }
          copy.shipperName = (copy.shipper && (copy.shipper.ShipperName || copy.shipper.ShipperName)) || ''
          copy.shipperIdentifier = (copy.shipper && ((copy.shipper.ShipperId) || (copy.shipper._id))) || ''
          return copy as Shipper
        })

        setData(merged as Shipper[]);
        setAllData(merged as Shipper[]);
      } catch (error) {
        console.error("Failed to fetch Shipper:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShipper();
  }, []);

  const [searchParams] = useSearchParams();
  React.useEffect(() => {
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    if (!q) {
      setData(allData)
      return
    }

    const filtered = allData.filter((o) => {
      const ShipperId = String(o.ShipperId || '').toString().toLowerCase()
      const shipperName = String(o.ShipperName || '').toString().toLowerCase()
      return (
        shipperName.includes(q) ||
        ShipperId.includes(q)
      )
    })

    setData(filtered)
  }, [searchParams, allData])

  const table = useReactTable({
    data,
    columns: shipperColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (loading) {
    return <TableSkeleton columns={shipperColumns.length} />;
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/Shipper/${row.original.ShipperId || row.original._id}`);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={shipperColumns.length}
                  className="h-24 text-center"
                >
                  No shippers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function OrderDataTable({ orders }: { orders?: Order[] }  = {}) {
  // OrderDataTable
  // - API မှ `getOrders()` ကို call ပြီး orders ကိုယူသည်။
  // - တကယ်ရှိရင် `getShippers()` နဲ့ merge လုပ်၍ shipper info ကို order နှင့် ပေါင်းစပ်ပေးသည်။
  // - URL query param `q` (search) ကို `useSearchParams` ကနေ ဖတ်ပြီး client-side filter လုပ်ပေးတယ်။
  // - `useReactTable` ကိုသုံးပြီး sorting/filtering/pagination စတာတွေကို ထိန်းချုပ်ပေးတယ်။
  // - row click မှာ `useNavigate` နဲ့ order detail page သို့ ပြောင်းပေးတယ်။
  const navigate = useNavigate()
  const [data, setData] = React.useState<Order[]>([]);
  const [allData, setAllData] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(!orders);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    if (orders) {
      setData(orders);
      setAllData(orders);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const orders = await getOrders();
        let shippers: Shipper[] = []
        try {
          shippers = await getShippers() as Shipper[]
        } catch (err) {
          console.warn('Failed to fetch shippers for merge:', err)
        }

        const shipperById = new Map<string, Shipper>()
        for (const s of shippers) {
          if ((s as any).ShipperId) shipperById.set((s as any).ShipperId.toString(), s)
          if (s._id) shipperById.set(s._id.toString(), s)
        }

        const merged = (orders as Order[]).map((o) => {
          const copy = { ...o } as any
          let shipper = undefined;
          if (copy.shipperId) {
            shipper = shipperById.get(copy.shipperId.toString());
            if (!shipper && typeof copy.shipperId === 'object') {
              if (copy.shipperId._id) shipper = shipperById.get(copy.shipperId._id.toString());
              if (!shipper && copy.shipperId.ShipperId) shipper = shipperById.get(copy.shipperId.ShipperId.toString());
            }
          }
          copy.shipper = shipper;
          copy.shipperName = (shipper && (shipper.ShipperName)) || '';
          copy.shipperIdentifier = (shipper && (shipper.ShipperId || shipper._id)) || '';
          return copy as Order
        })

        setData(merged as Order[]);
        setAllData(merged as Order[]);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setData([]);
        setAllData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const [searchParams] = useSearchParams();
  React.useEffect(() => {
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    if (!q) {
      setData(allData)
      return
    }

    const filtered = allData.filter((o) => {
      const tracking = (o.TrackingId || '').toString().toLowerCase()
      const orderId = (o._id || '').toString().toLowerCase()
      const customer = (o.CustomerName || '').toString().toLowerCase()
      const shipperName = (((o as any).shipperName) || ((o as any).shipper && ((o as any).shipper.ShipperName || ''))) .toString().toLowerCase()
      const shipperId = (((o as any).shipperIdentifier) || ((o as any).shipper && ((o as any).shipper.ShipperId || (o as any).shipper._id) || '')).toString().toLowerCase()

      return (
        tracking.includes(q) ||
        orderId.includes(q) ||
        customer.includes(q) ||
        shipperName.includes(q) ||
        shipperId.includes(q)
      )
    })

    setData(filtered)
  }, [searchParams, allData])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (loading) {
    return <TableSkeleton columns={columns.length} />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4"></div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/Order/${row.original.TrackingId}`);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
