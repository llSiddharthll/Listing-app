import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const ListingDetail = () => {
  const apiUrl = import.meta.env.VITE_BASE_URL;
  const { id } = useParams();
  const [listing, setListing] = useState(null);
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
        setListing(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch listing details");
        console.error("Error fetching listing details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [apiUrl, id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`${apiUrl}/listing_api/listings/${id}/`);
        navigate("/listings");
      } catch (err) {
        setError(err.message || "Failed to delete listing");
        console.error("Error deleting listing:", err);
      }
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(
        `${apiUrl}/listing_api/listings/${id}/export/${format}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `listing_${id}.${format.split(".").pop()}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Error exporting listing:", err);
      alert("Failed to export listing. Please try again.");
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

  if (!listing) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Listing not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Listing Details</h1>
        <div className="flex space-x-4">
          <Link
            to={`/listings/${id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit
          </Link>
          <div className="relative group">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
              <button
                onClick={() => handleExport("shopify.csv")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Shopify (CSV)
              </button>
              <button
                onClick={() => handleExport("amazon.tsv")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Amazon (TSV)
              </button>
              <button
                onClick={() => handleExport("flipkart.xlsx")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Flipkart (Excel)
              </button>
              <button
                onClick={() => handleExport("myntra.csv")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Myntra (CSV)
              </button>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete
          </button>
          <Link
            to="/listings"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Listings
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-2">
              <p>
                <strong>Title:</strong> {listing.title}
              </p>
              <p>
                <strong>Description:</strong> {listing.description}
              </p>
              <p>
                <strong>SKU:</strong> {listing.item_sku}
              </p>
              <p>
                <strong>Brand:</strong> {listing.brand}
              </p>
              <p>
                <strong>Product Type:</strong> {listing.product_type}
              </p>
              <p>
                <strong>Department:</strong> {listing.department_name}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
            <div className="space-y-2">
              <p>
                <strong>Standard Price:</strong> ${listing.standard_price}
              </p>
              <p>
                <strong>Sale Price:</strong> ${listing.sale_price || "N/A"}
              </p>
              <p>
                <strong>Quantity:</strong> {listing.quantity}
              </p>
              <p>
                <strong>Status:</strong> {listing.status}
              </p>
              <p>
                <strong>Fulfilled By:</strong> {listing.fullfilled_by}
              </p>
              <p>
                <strong>Procurement Type:</strong> {listing.procurement_type}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p>
                <strong>Material Type:</strong> {listing.material_type}
              </p>
              <p>
                <strong>Metal Type:</strong> {listing.metal_type}
              </p>
              <p>
                <strong>Metal Stamp:</strong> {listing.metal_stamp}
              </p>
              <p>
                <strong>Gem Type:</strong> {listing.gem_type}
              </p>
              <p>
                <strong>Ring Size:</strong> {listing.ring_size}
              </p>
              <p>
                <strong>Ring Sizing System:</strong>{" "}
                {listing.ring_sizing_system}
              </p>
            </div>

            <div className="space-y-2">
              <p>
                <strong>Back Finding:</strong> {listing.back_finding}
              </p>
              <p>
                <strong>Chain Type:</strong> {listing.chain_type}
              </p>
              <p>
                <strong>Clasp Type:</strong> {listing.clasp_type}
              </p>
              <p>
                <strong>Bracelet Style:</strong> {listing.bracelet_style}
              </p>
              <p>
                <strong>Occasion:</strong> {listing.ocassion}
              </p>
              <p>
                <strong>Trend:</strong> {listing.trend}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Dimensions & Care</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p>
                <strong>Weight:</strong> {listing.weight}
              </p>
              <p>
                <strong>Length:</strong> {listing.length}
              </p>
              <p>
                <strong>Width:</strong> {listing.width}
              </p>
              <p>
                <strong>Height:</strong> {listing.height}
              </p>
            </div>

            <div className="space-y-2">
              <p>
                <strong>HSN Code:</strong> {listing.hsn_code}
              </p>
              <p>
                <strong>Material Care:</strong> {listing.material_care}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          <div className="space-y-4">
            {listing.main_image_url && (
              <div>
                <p>
                  <strong>Main Image:</strong>
                </p>
                <img
                  src={listing.main_image_url}
                  alt="Main"
                  className="mt-2 rounded-lg shadow-sm max-w-xs"
                />
              </div>
            )}
            {listing.additional_image_urls &&
              listing.additional_image_urls.length > 0 && (
                <div>
                  <p>
                    <strong>Additional Images:</strong>
                  </p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {listing.additional_image_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Additional ${index + 1}`}
                        className="rounded-lg shadow-sm max-w-xs"
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
