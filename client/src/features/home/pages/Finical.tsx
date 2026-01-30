import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNavbar } from "@/components/contentarea"
import { ShipperDataTable } from "@/components/DataTable"
export function Finance() {
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
            <ShipperDataTable/>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
