import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/contentarea"
import { ShipmentDataTable } from "@/components/DataTable"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createShipment, getShipments, type ShipmentData } from "@/api/serviceApi"
import { useNavigate, useSearchParams } from "react-router-dom"

export function ShipmentPage() {
  const [showModal, setShowModal] = useState(false) // create modal open/close
  const [newFromHub, setFromHub] = useState("") // from hub value
  const [newtohub, setToHub] = useState("") // to hub value
  const [statusLoading] = useState(false) // modal submit loading state
  const navigate = useNavigate() // create success -> /Shipment route
  const [, setLoading] = useState(false) // create API loading state
  const [, setError] = useState<string | null>(null) // create error message
  const [, setShipment] = useState<ShipmentData[] | undefined>(undefined) // refresh data state
  const [searchParams, setSearchParams] = useSearchParams() // URL query state

  const openStatusModal = () => {
    setShowModal(true) // create button click -> modal open
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // default form reload ကိုတား
    setLoading(true)
    try {
      await createShipment({
        FromHub: newFromHub,
        ToHub: newtohub,
      }) // API: create shipment

      try {
        const latest = await getShipments() // API: refresh shipment list
        setShipment(latest || [])
      } catch (err) {
        console.warn("Failed to refresh routes after create:", err)
      }

      setShowModal(false) // success -> modal close
      navigate("/Shipment") // shipment list သို့ပြန်
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error creating Shipment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">
          <div className="p-4 flex flex-col">
            <div className="flex items-center mb-6 justify-between w-170"></div>
            <div className="flex gap-2">
              <Input
                placeholder="Search by Shipment ID..."
                value={searchParams.get("q") || ""}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchParams(value ? { q: value } : {}) // search input -> URL query update
                }}
                className="max-w-sm"
              />
              <Button
                variant="ghost"
                className="rounded border-b ml-auto transform motion-safe:hover:scale-110"
                onClick={openStatusModal}
              >
                Create Shipment
              </Button>

              <form onSubmit={handleSubmit}>
                {/* modal form submit -> handleSubmit */}
                {showModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 relative animate-fade-in">
                      <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                        onClick={() => setShowModal(false)} // close click -> modal close
                        aria-label="Close"
                      >
                        x
                      </button>
                      <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Shipment</h2>
                      <div className="mb-6">
                        <label htmlFor="status-Hub1" className="block text-sm font-medium text-gray-700 mb-2">From</label>
                        <Select value={newFromHub} onValueChange={(value) => setFromHub(value)}>
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
                        <label htmlFor="status-Hub2" className="block text-sm font-medium text-gray-700 mb-2">To</label>
                        <Select value={newtohub} onValueChange={(value) => setToHub(value)}>
                          <SelectTrigger className="w-full min-h-[44px] text-gray-800 shadow-sm">
                            <SelectValue placeholder="Select Hub" />
                            <SelectContent>
                              <SelectItem value="SH-TWN-PS1">SH-TWN-PS1</SelectItem>
                              <SelectItem value="SH-TWN-PS2">SH-TWN-PS2</SelectItem>
                              <SelectItem value="SH-TWN-PS3">SH-TWN-PS3</SelectItem>
                            </SelectContent>
                          </SelectTrigger>
                        </Select>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <Button type="submit" disabled={statusLoading} className="px-6 py-2 font-semibold rounded-lg">
                          {statusLoading ? "Creating..." : "Create"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowModal(false)} // cancel click -> modal close
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
            <ShipmentDataTable /> {/* shipment list table */}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
