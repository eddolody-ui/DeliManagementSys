import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/contentarea"
import { RouteDataTable } from "@/components/DataTable"
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
import { useNavigate, useSearchParams } from "react-router-dom"
import { Input } from "@/components/ui/input"

export function RoutePage() {
  const [showModal, setShowModal] = useState(false) // create modal ဖွင့်/ပိတ်
  const [newHub, setNewHub] = useState("") // selected hub value
  const [newRider, setNewRider] = useState("") // selected rider value
  const [statusLoading] = useState(false) // modal submit button loading state
  const navigate = useNavigate() // create success ဖြစ်ရင် route page သို့ပြောင်း
  const [, setLoading] = useState(false) // create API loading state
  const [, setError] = useState<string | null>(null) // create error message state
  const [, setRoutes] = useState<RouteData[] | undefined>(undefined) // refresh data state
  const [searchParams, setSearchParams] = useSearchParams() // URL query state

  const openStatusModal = () => {
    setShowModal(true) // "Create Route" click -> modal open
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // default form reload ကိုတား

    if (!newHub || !newRider) {
      setError("Please select hub and rider") // validation fail
      return
    }

    setLoading(true)
    try {
      await createRoute({
        Hub: newHub,
        AssignPersonName: newRider,
        DateCreated: new Date(),
      }) // API: create route

      try {
        const latest = await getRoutes() // API: list route refresh
        setRoutes(latest || [])
      } catch (err) {
        console.warn("Failed to refresh routes after create:", err)
      }

      setShowModal(false) // success -> modal close
      navigate("/Route") // route list သို့ပြန်သွား
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error creating Route")
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
            <div className="flex">
              <Input
                placeholder="Search by Route ID..."
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
                Create Route
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
                      <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Route</h2>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Route ID</label>
                        <div className="w-full rounded-md border px-3 py-2 bg-gray-50 text-sm font-medium text-gray-800">{"(will be generated)"}</div>
                      </div>
                      <div className="mb-6">
                        <label htmlFor="status-Hub" className="block text-sm font-medium text-gray-700 mb-2">Select Hub</label>
                        <Select value={newHub} onValueChange={(value) => setNewHub(value)}>
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
                        <label htmlFor="status-Rider" className="block text-sm font-medium text-gray-700 mb-2">Select Rider</label>
                        <Select value={newRider} onValueChange={(value) => setNewRider(value)}>
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
            <RouteDataTable /> {/* route list table */}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
