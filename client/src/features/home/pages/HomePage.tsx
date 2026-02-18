import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/contentarea"
import { TopNavbar } from "@/components/contentarea"
import DashboardPage from "@/components/contentarea"
import { OrderDataTable } from "@/components/DataTable"

export function HomePage() {
  return (
    <SidebarProvider>
      {/* SidebarProvider က sidebar context ကို အောက်က layout နဲ့ချိတ်ပေးတယ် */}
      <div className="flex min-h-screen w-full">
        <AppSidebar /> {/* ဘယ်ဘက် navigation sidebar */}
        <SidebarInset className="flex flex-col w-full">
          {/* sidebar layout ထဲက main content container */}
          <TopNavbar /> {/* အပေါ် navbar */}
          <main className="flex-1 p-4">
            <DashboardPage /> {/* dashboard summary component */}
            <OrderDataTable /> {/* order list table component */}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
