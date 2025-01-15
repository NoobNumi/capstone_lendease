import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const DashboardFinal = () => {
  const [shippingFees, setShippingFees] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("Camarines Sur");
  const [formData, setFormData] = useState({ province: "", name: "", fee: "" });
  const [editIndex, setEditIndex] = useState(null);

  // Fetch shipping fees from backend on mount
  useEffect(() => {
    const fetchShippingFees = async () => {
      try {
        const response = await axios.get('/shipping-fees'); // Adjust the API endpoint as needed
        setShippingFees(response.data);
      } catch (error) {
        console.error('Error fetching shipping fees:', error);
        toast.error('Error fetching shipping fees');
      }
    };

    fetchShippingFees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    // setShippingFees()
  };

  const addOrUpdateFee = async () => {
    if (editIndex !== null) {
      // Update fee via API
      try {
        await axios.put(`/shipping-fees/${formData.province}`, {
          municipality: formData.name,
          fee: parseFloat(formData.fee),
        });
        setShippingFees((prevFees) =>
          prevFees.map((entry) =>
            entry.province === formData.province
              ? {
                ...entry,
                municipalities: entry.municipalities.map((m, i) =>
                  i === editIndex ? { name: formData.name, fee: parseFloat(formData.fee) } : m
                ),
              }
              : entry
          )
        );
        toast.success('Shipping fee updated successfully');
      } catch (error) {
        console.error('Error updating fee:', error);
        toast.error('Error updating shipping fee');
      }
    } else {
      // Add new fee via API
      try {
        await axios.post('/shipping-fees', {
          province: formData.province,
          municipality: formData.name,
          fee: parseFloat(formData.fee),
        });
        setShippingFees((prevFees) =>
          prevFees.map((entry) =>
            entry.province === formData.province
              ? {
                ...entry,
                municipalities: [...entry.municipalities, { name: formData.name, fee: parseFloat(formData.fee) }],
              }
              : entry
          )
        );
        toast.success('Shipping fee added successfully');
      } catch (error) {
        console.error('Error adding fee:', error);
        toast.error('Error adding shipping fee');
      }
    }
    resetForm();
  };

  const editFee = (province, index) => {
    const provinceData = shippingFees.find((p) => p.province === province);
    const municipality = provinceData.municipalities[index];
    setFormData({ province, name: municipality.name, fee: municipality.fee });
    setEditIndex(index);
  };

  const deleteFee = async (province, index) => {
    try {
      await axios.delete(`/shipping-fees/${province}/${index}`); // Adjust API endpoint to delete a fee
      setShippingFees((prevFees) =>
        prevFees.map((entry) =>
          entry.province === province
            ? {
              ...entry,
              municipalities: entry.municipalities.filter((_, i) => i !== index),
            }
            : entry
        )
      );
      toast.success('Shipping fee deleted successfully');
    } catch (error) {
      console.error('Error deleting fee:', error);
      toast.error('Error deleting shipping fee');
    }
  };

  const resetForm = () => {
    setFormData({ province: "", name: "", fee: "" });
    setEditIndex(null);
  };

  return (
    <div className="p-6 bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Shipping Fee Manager</h1>
      <div className="mb-4">
        <label className="block text-gray-700">Filter by Province</label>
        <select
          className="w-full px-4 py-2 border rounded"
          value={selectedProvince}
          onChange={(e) => {

            console.log(e.target.value)
            setSelectedProvince(e.target.value)
          }}
        >
          <option value="">All Provinces</option>
          {shippingFees.map((entry, index) => (
            <option key={index} value={entry.province}>
              {entry.province}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{editIndex !== null ? "Edit Fee" : "Add Fee"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="w-full px-4 py-2 border rounded"
            name="province"
            value={formData.province}
            onChange={handleInputChange}
          >
            <option value="">Select Province</option>
            {shippingFees.map((entry, index) => (
              <option key={index} value={entry.province}>
                {entry.province}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="name"
            className="w-full px-4 py-2 border rounded"
            placeholder="Municipality Name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="fee"
            className="w-full px-4 py-2 border rounded"
            placeholder="Shipping Fee"
            value={formData.fee}
            onChange={handleInputChange}
          />
        </div>
        <div className="mt-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={addOrUpdateFee}
          >
            {editIndex !== null ? "Update" : "Add"}
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={resetForm}>
            Reset
          </button>
        </div>
      </div>
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Province</th>
            <th className="border px-4 py-2">Municipality</th>
            <th className="border px-4 py-2">Shipping Fee</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>



          {shippingFees
            .filter((entry) => entry.province === selectedProvince || !selectedProvince)
            .flatMap((entry) =>
              entry.municipalities.map((municipality, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{entry.province}</td>
                  <td className="border px-4 py-2">{municipality.name}</td>
                  <td className="border px-4 py-2">₱{municipality.fee}</td>
                  <td className="border px-4 py-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => editFee(entry.province, index)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => deleteFee(entry.province, municipality.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardFinal;
