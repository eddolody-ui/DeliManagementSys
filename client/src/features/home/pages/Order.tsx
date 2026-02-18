import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNavbar } from "@/components/contentarea"
import { OrderDataTable } from "@/components/DataTable"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"

export function Order() {
  // useReactTable ကို initialize လုပ်ပြီး table pipeline ကို page နဲ့ချိတ်တယ်
  const table = useReactTable({
    data: [], // table data source (ယခု placeholder)
    columns: [], // table column definition (ယခု placeholder)
    getCoreRowModel: getCoreRowModel(), // အခြေခံ row model
    getFilteredRowModel: getFilteredRowModel(), // filter ပြီး row model
  })

  table.getRowModel().rows // current row model evaluate
  table.getPrePaginationRowModel().rows // pagination မတိုင်ခင် row model evaluate

  return (
    <SidebarProvider>
      {/* sidebar context ကို AppSidebar/SidebarInset နဲ့ချိတ်ပေးတယ် */}
      <div className="flex min-h-screen w-full">
        <AppSidebar /> {/* ဘယ်ဘက် sidebar navigation */}
        <SidebarInset className="flex flex-col w-full">
          {/* sidebar layout ထဲက main content area */}
          <TopNavbar /> {/* အပေါ် navigation bar */}
          <div className="p-4">
            <OrderDataTable /> {/* order list table ကို render */}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
