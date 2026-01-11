import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNavbar } from "@/components/contentarea"
import {OrderDataTable}  from "@/components/DataTable"

export function Order() {
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
