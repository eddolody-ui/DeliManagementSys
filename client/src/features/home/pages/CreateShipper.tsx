import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AppSidebar, TopNavbar } from "@/components/contentarea"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createShipper } from "@/api/serviceApi";

export function CreateShipper() {
  const navigate = useNavigate(); // ⬅️ initialize navigate
  
  // Loading state to disable form during API call
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await createShipper(formData);
    navigate("/Shipper"); // ⬅️ redirect to order page
  } catch (error) {
    console.error("Error creating order:", error);
    // You can add error handling here, like showing a toast
  } finally {
    setLoading(false);
  }
};

  // Form data state - holds all input values
  const [formData, setFormData] = useState({
    ShipperId: "",
    ShipperName : "",
    ShipperContact: "",
    ShipperAddress: "",
    PickUpAddress: "",
    BillingType: "",
    Note: ""
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  } 
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNavbar />
          <div className="p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Manual Entry */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                  Create Shipper
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipper ID                    
                    </label>
                    <Input
                      value={formData.ShipperId}
                      onChange={handleChange}
                      name="ShipperId"
                      placeholder="Enter Shipper ID"
                      className="rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipper Name
                    </label>
                    <Input
                      value={formData.ShipperName}
                      onChange={handleChange}
                      name="ShipperName"
                      placeholder="Enter Shipper name"
                      className="rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipper Contact
                    </label>
                    <Input
                      value={formData.ShipperContact}
                      onChange={handleChange}
                      name="ShipperContact"
                      placeholder="Enter Shipper number"
                      className="rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipper Address
                    </label>
                    <Input
                      value={formData.ShipperAddress}
                      onChange={handleChange}
                      name="ShipperAddress"
                      placeholder="Enter full address"
                      className="rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PickUp Address
                    </label>
                    <Input
                      value={formData.PickUpAddress}
                      onChange={handleChange}
                      name="PickUpAddress"
                      placeholder="Enter PickUp Address"
                      className="rounded-lg focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Type
                    </label>
                    <div className="flex gap-2" >
                      <select value={formData.BillingType} onChange={handleChange} name="BillingType" className="rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-300 px-3 py-2 bg-white text-sm">
                        <option value="COD">KBZ</option>
                        <option value="Prepaid">Banking</option>
                        <option value="Return">PrePaid</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note
                    </label>
                    <Input
                      value={formData.Note}
                      onChange={handleChange}
                      name="Note"
                      placeholder="Any delivery notes"
                      className="rounded-lg focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </div>
                <Button  type="submit" disabled={loading} className="sticky px-5 py-2 mt-8 rounded-lg bg-gray-600 hover:bg-gray-500 text-white">
                  {loading ? "Creating..." : "Create Shipper"}
                </Button>
              </div>
            </form>
          </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

