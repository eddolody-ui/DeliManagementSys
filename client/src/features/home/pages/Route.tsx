import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar} from "@/components/contentarea"
import {RouteDataTable}  from "@/components/DataTable"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { createRoute, getRoutes, type RouteData } from "@/api/serviceApi"
import { useNavigate } from "react-router-dom"


export function RoutePage() {
  const [showModal, setShowModal] = useState(false);
  const [newHub, setNewHub] = useState("");  
  const [newRider, setNewRider] = useState("");
  const [statusLoading] = useState(false);
  const navigate = useNavigate();
  const [, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [, setRoutes] = useState<RouteData[] | undefined>(undefined);

  const openStatusModal = () => {
    // generate a stable RouteId for this creation session and show modal
    setShowModal(true);
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newHub || !newRider) {
    setError("Please select hub and rider");
    return;
  }

  setLoading(true);
    try {
    await createRoute({
      Hub: newHub,
      AssignPersonName: newRider,
      DateCreated: new Date(),
    });
    console.log(createRoute);

    // refresh the displayed routes so the new Route appears immediately
    try {
      const latest = await getRoutes();
      setRoutes(latest || []);
    } catch (err) {
      console.warn("Failed to refresh routes after create:", err);
    }

    setShowModal(false);
    navigate("/Route");
  } catch (err: any) {
    setError(err?.response?.data?.message || "Error creating Route");
  } finally {
    setLoading(false);
  }
};

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />
        {/* Main content */}
        <SidebarInset className="flex flex-col w-full">
          {/* Content below */}
          <div className="p-4 flex flex-col">
            <div className="flex items-center mb-6 justify-between w-170">
            </div>
                 <div className="flex">
                        <div className="">
                            <Select >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Hub" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SH-TWN-001">SH-TWN-001</SelectItem>
                                    <SelectItem value="SH-TWN-002">SH-TWN-002</SelectItem>
                                    <SelectItem value="SH-TWN-003">SH-TWN-003</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    <Button variant="ghost" className="rounded border-b ml-auto transform motion-safe:hover:scale-110" 
                    onClick={openStatusModal}>Create Route</Button>
                            {/* Status Update Modal */}
                            <form onSubmit={handleSubmit}>
                            {showModal && (
                                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray bg-opacity-30 backdrop-blur-sm">
                                                <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 relative animate-fade-in">
                                                  <button
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                                                    onClick={() => setShowModal(false)}
                                                    aria-label="Close">
                                                    ×
                                                  </button>
                                                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Route</h2>
                                                  <div className="mb-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Route ID</label>
                                                    <div className="w-full rounded-md border px-3 py-2 bg-gray-50 text-sm font-medium text-gray-800">{"(will be generated)"}</div>
                                                  </div>
                                                  <div className="mb-6">
                                    <label htmlFor="status-Hub" className="block text-sm font-medium text-gray-700 mb-2">Select Hub</label>
                                    <Select
                                        value={newHub}
                                        onValueChange={(value) => setNewHub(value)}                                      >
                                        <SelectTrigger className="w-full min-h-[44px] text-gray-800 shadow-sm">
                                          <SelectValue placeholder="Select Hub" />
                                            <SelectContent>
                                                <SelectItem value="SH-TWN-001">SH-TWN-001</SelectItem>
                                                <SelectItem value="SH-TWN-002">SH-TWN-002</SelectItem>
                                                <SelectItem value="SH-TWN-003">SH-TWN-003</SelectItem>
                                            </SelectContent>
                                        </SelectTrigger>
                                      </Select>
                                  </div>
                                  <div className="mb-6">
                                    <label htmlFor="status-Rider" className="block text-sm font-medium text-gray-700 mb-2"
                                    >Select Rider</label>
                                    <Select
                                        value={newRider}
                                        onValueChange={(value) => setNewRider(value)}                                      >
                                        <SelectTrigger className="w-full min-h-[44px] text-gray-800 shadow-sm">
                                          <SelectValue placeholder="Select Rider" />
                                            <SelectContent>
                                                <SelectItem value="SH-TWN-PS1">SH-TWN-PS1</SelectItem>
                                                <SelectItem value="SH-TWN-PS2">SH-TWN-PS2</SelectItem>
                                                <SelectItem value="SH-TWN-PS3">SH-TWN-PS3</SelectItem>
                                            </SelectContent>
                                        </SelectTrigger>
                                      </Select>
                                  </div>
                                  <div className="flex gap-3 justify-end">
                                    <Button type="submit"
                                      disabled={statusLoading}
                                      className="px-6 py-2 font-semibold rounded-lg"
                                    >
                                      {statusLoading ? "Creating..." : "Create"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowModal(false)}
                                      disabled={statusLoading}
                                      className="px-6 py-2 font-semibold rounded-lg border-gray-300"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                            </form>
                        </div>
            <RouteDataTable/>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
