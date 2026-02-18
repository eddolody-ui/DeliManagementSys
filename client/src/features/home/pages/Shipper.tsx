import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNavbar } from "@/components/contentarea"
import { ShipperDataTable } from "@/components/DataTable"

export function Shipper() {
  return (
    <SidebarProvider>
      {/* sidebar context provider */}
      <div className="flex min-h-screen w-full">
        <AppSidebar /> {/* shipper module sidebar */}
        <SidebarInset className="flex flex-col w-full">
          <TopNavbar /> {/* top navigation */}
          <div className="p-4">
            <ShipperDataTable /> {/* shipper list table */}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
