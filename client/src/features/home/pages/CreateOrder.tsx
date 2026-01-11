import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppSidebar, TopNavbar } from "@/components/contentarea";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { createOrder, getShippers, type ShipperData } from "@/api/serviceApi";

/**
 * CreateOrderForm Component
 * - Create new orders
 * - Show success/error toast using Sonner
 */
export function CreateOrderForm() {
  const navigate = useNavigate();
  const { shipperId } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [, setShippers] = useState<(ShipperData & { _id: string })[]>([]);

  // Form data state
  const [formData, setFormData] = useState({
    TrackingId: "",
    CustomerName: "",
    CustomerContact: "",
    CustomerAddress: "",
    Amount: 0,
    Type: "COD",
    Note: "",
    Status: "Pending",
    shipperId: shipperId || ""
  });

  // Fetch shippers
  useEffect(() => {
    const fetchShippers = async () => {
      try {
        const shippersData = await getShippers();
        setShippers(shippersData);
      } catch (err) {
        console.error("Error fetching shippers:", err);
      }
    };
    fetchShippers();
  }, []);

  // Update shipperId if from URL
  useEffect(() => {
    if (!shipperId) return;
    setFormData(prev => ({ ...prev, shipperId }));
  }, [shipperId]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "Amount" ? Number(value) : value,
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.shipperId) {
      setError("Shipper is required. Cannot create order.");
      setLoading(false);
      return;
    }

    try {
      await createOrder({ ...formData, Status: formData.Status || "Pending" });

      // Show success toast

      navigate("/Shipper"); // Redirect after creation
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNavbar />
        <div className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
              Create Order
            </h2>

            {error && (
              <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tracking ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking ID
                </label>
                <Input
                  name="TrackingId"
                  value={formData.TrackingId}
                  onChange={handleChange}
                  placeholder="Enter Tracking ID"
                  className="rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <Input
                  name="CustomerName"
                  value={formData.CustomerName}
                  onChange={handleChange}
                  placeholder="Enter Customer Name"
                  className="rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Customer Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Contact
                </label>
                <Input
                  name="CustomerContact"
                  value={formData.CustomerContact}
                  onChange={handleChange}
                  placeholder="Enter Customer Contact"
                  className="rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Customer Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Address
                </label>
                <Input
                  name="CustomerAddress"
                  value={formData.CustomerAddress}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  className="rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <Input
                  name="Amount"
                  type="number"
                  min={0}
                  value={formData.Amount}
                  onChange={handleChange}
                  placeholder="Enter Amount"
                  className="rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="Type"
                  value={formData.Type}
                  onChange={handleChange}
                  className="rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-300 px-3 py-2 bg-white text-sm w-full"
                  required
                >
                  <option value="COD">COD</option>
                  <option value="Prepaid">Prepaid</option>
                  <option value="Return">Return</option>
                </select>
              </div>

              {/* Note */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <Input
                  name="Note"
                  value={formData.Note}
                  onChange={handleChange}
                  placeholder="Any delivery notes"
                  className="rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                {loading ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
