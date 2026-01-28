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
import { createShipment, getShipments, type ShipmentData } from "@/api/serviceApi"
import { useNavigate } from "react-router-dom"

export function ShipmentPage() {
  const [showModal, setShowModal] = useState(false);
  const [newFromHub, setFromHub] = useState("");
  const [newtohub, setToHub] = useState("");
  const [statusLoading] = useState(false);
  const navigate = useNavigate();
  const [, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [, setShipment] = useState<ShipmentData[] | undefined>(undefined);

  const openStatusModal = () => {
    // generate a stable RouteId for this creation session and show modal
    setShowModal(true);
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);
    try {
    await createShipment({
      FromHub: newFromHub,
      ToHub: newtohub,
    });
    console.log(createShipment);

    // refresh the displayed routes so the new Route appears immediately
    try {
      const latest = await getShipments();
      setShipment(latest || []);
    } catch (err) {
      console.warn("Failed to refresh routes after create:", err);
    }

    setShowModal(false);
    navigate("/Shipment");
  } catch (err: any) {
    setError(err?.response?.data?.message || "Error creating Shipment");
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
                                                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Shipment</h2>
                                                  <div className="mb-6">
                                    <label htmlFor="status-Hub" className="block text-sm font-medium text-gray-700 mb-2">From</label>
                                    <Select
                                        value={newFromHub}
                                        onValueChange={(value) => setFromHub(value)}                                      >
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
                                    >To</label>
                                    <Select
                                        value={newtohub}
                                        onValueChange={(value) => setToHub(value)}                                      >
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
