import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNavbar } from "@/components/contentarea"
import { ShipperDataTable } from "@/components/DataTable"

export function Finance() {
  return (
    <SidebarProvider>
      {/* shared app shell: sidebar + main area */}
      <div className="flex min-h-screen w-full">
        <AppSidebar /> {/* sidebar navigation */}
        <SidebarInset className="flex flex-col w-full">
          {/* main content pane */}
          <TopNavbar /> {/* top navigation */}
          <div className="p-4">
            <ShipperDataTable /> {/* finance view မှာပြမယ့် data table */}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
