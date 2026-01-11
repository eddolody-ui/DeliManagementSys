import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/contentarea"
import { TopNavbar } from "@/components/contentarea"
import DashboardPage from "@/components/contentarea"
import {OrderDataTable} from "@/components/DataTable"

export function HomePage() {
  return (
    <SidebarProvider>
  <div className="flex min-h-screen w-full">
    {/* Sidebar */}
    <AppSidebar />

    {/* Main content */}
    <SidebarInset className="flex flex-col w-full">
      {/* Top Navbar */}
      <TopNavbar />

      {/* Page content */}
      <main className="flex-1 p-4">
        <DashboardPage/>
        <OrderDataTable/>
      </main>
    </SidebarInset>
  </div>
</SidebarProvider>

)
}
