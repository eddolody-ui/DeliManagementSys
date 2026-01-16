import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNavbar } from "@/components/contentarea"
import {OrderDataTable}  from "@/components/DataTable"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"


export function Order() {
  const table = useReactTable({
  data: [],
  columns: [],
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
table.getRowModel().rows
table.getPrePaginationRowModel().rows

  return (  
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />
        {/* Main content */}
        <SidebarInset className="flex flex-col w-full">
        <TopNavbar/>
          {/* Top bar with button */}
          {/* Content below */}
          <div className="p-4">
            <OrderDataTable/>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
