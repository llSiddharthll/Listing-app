import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const EditListing = () => {
  const apiUrl = import.meta.env.VITE_BASE_URL;
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    product_type: "",
    bullet_points: ["", "", "", "", ""],
    item_sku: "",
    quantity: 0,
    brand: "",
    standard_price: "",
    sale_price: "",
    main_image_url: "",
    additional_image_urls: [],
    department_name: "womens",
    material_type: "",
    metal_type: "",
    metal_stamp: "",
    gem_type: "",
    jewellery_material_categorisation: "",
    ring_size: 0,
    ring_sizing_system: "India",
    back_finding: "",
    chain_type: "",
    clasp_type: "",
    bracelet_style: "",
    status: "pending",
    fullfilled_by: "merchant",
    procurement_type: "in_stock",
    ocassion: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    hsn_code: "",
    trend: "",
    material_care: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${apiUrl}/listing_api/listings/${id}/`,
        );
        const listingData = response.data;

        // Ensure bullet_points is an array of 5 strings
        const bulletPoints = Array.isArray(listingData.bullet_points)
          ? listingData.bullet_points.slice(0, 5)
          : ["", "", "", "", ""];

        // Fill any missing bullet points with empty strings
        while (bulletPoints.length < 5) {
          bulletPoints.push("");
        }

        setFormData({
          ...listingData,
          bullet_points: bulletPoints,
        });
      } catch (err) {
        setError(err.message || "Failed to fetch listing details");
        console.error("Error fetching listing details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [apiUrl, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleBulletPointChange = (index, value) => {
    const newBulletPoints = [...formData.bullet_points];
    newBulletPoints[index] = value;
    setFormData({
      ...formData,
      bullet_points: newBulletPoints,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Filter out empty bullet points
      const filteredBulletPoints = formData.bullet_points.filter(
        (point) => point.trim() !== "",
      );

      const payload = {
        ...formData,
        bullet_points: filteredBulletPoints,
        quantity: parseInt(formData.quantity) || 0,
        ring_size: parseInt(formData.ring_size) || 0,
        standard_price: parseFloat(formData.standard_price) || 0,
        sale_price: formData.sale_price
          ? parseFloat(formData.sale_price)
          : null,
        weight: parseFloat(formData.weight) || 0,
        length: parseFloat(formData.length) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
      };

      await axios.put(`${apiUrl}/listing_api/listings/${id}/`, payload);
      navigate(`/listings/${id}`);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      // DRF validation error case
      if (status === 400 && data && typeof data === "object") {
        setError(data); // { item_sku: ["..."], hsn_code: ["..."] }
        setError(
          "Please fill out all the required fields (like: Item SKU, HSN Code, etc.).",
        );
      } else {
        setError(data?.message || err.message || "Failed to update listing");
      }

      console.error("Error updating listing:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Listing</h1>
        <div className="flex space-x-4">
          <Link
            to={`/listings/${id}`}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Type
                </label>
                <input
                  type="text"
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item SKU
                </label>
                <input
                  type="text"
                  name="item_sku"
                  value={formData.item_sku}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Standard Price
                </label>
                <input
                  type="number"
                  name="standard_price"
                  value={formData.standard_price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sale Price
                </label>
                <input
                  type="number"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Bullet Points</h2>
          <div className="space-y-2">
            {formData.bullet_points.map((point, index) => (
              <input
                key={index}
                type="text"
                value={point}
                onChange={(e) => handleBulletPointChange(index, e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder={`Bullet Point ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Material Type
                </label>
                <input
                  type="text"
                  name="material_type"
                  value={formData.material_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Metal Type
                </label>
                <input
                  type="text"
                  name="metal_type"
                  value={formData.metal_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Metal Stamp
                </label>
                <input
                  type="text"
                  name="metal_stamp"
                  value={formData.metal_stamp}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gem Type
                </label>
                <input
                  type="text"
                  name="gem_type"
                  value={formData.gem_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ring Size
                </label>
                <input
                  type="number"
                  name="ring_size"
                  value={formData.ring_size}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ring Sizing System
                </label>
                <input
                  type="text"
                  name="ring_sizing_system"
                  value={formData.ring_sizing_system}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Back Finding
                </label>
                <input
                  type="text"
                  name="back_finding"
                  value={formData.back_finding}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chain Type
                </label>
                <input
                  type="text"
                  name="chain_type"
                  value={formData.chain_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Dimensions & Care</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Length
                </label>
                <input
                  type="text"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Width
                </label>
                <input
                  type="text"
                  name="width"
                  value={formData.width}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Height
                </label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  HSN Code
                </label>
                <input
                  type="text"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Material Care
                </label>
                <input
                  type="text"
                  name="material_care"
                  value={formData.material_care}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trend
                </label>
                <input
                  type="text"
                  name="trend"
                  value={formData.trend}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Occasion
                </label>
                <input
                  type="text"
                  name="ocassion"
                  value={formData.ocassion}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
