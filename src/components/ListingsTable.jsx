import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  Edit2,
  Download,
  Plus,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Trash2,
  ExternalLink,
  Loader2,
  Package,
} from "lucide-react";

const ListingsTable = () => {
  const apiUrl = import.meta.env.VITE_BASE_URL;

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // Close export menu on outside click + ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!exportMenuRef.current) return;
      if (!exportMenuRef.current.contains(e.target)) setShowExportMenu(false);
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setShowExportMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/listing_api/listings/`);
      if (Array.isArray(response.data)) setListings(response.data);
      else if (response.data?.results) setListings(response.data.results);
      else setListings([]);
    } catch (err) {
      setError(err.message || "Failed to fetch listings");
      console.error("Error fetching listings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id) => navigate(`/listings/${id}`);
  const handleEdit = (id) => navigate(`/listings/${id}/edit`);

  const confirmDelete = (listing) => {
    setListingToDelete(listing);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setListingToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;

    setDeletingId(listingToDelete.product_id);

    try {
      await axios.delete(
        `${apiUrl}/listing_api/listings/${listingToDelete.product_id}/`
      );

      setListings((prev) =>
        prev.filter((l) => l.product_id !== listingToDelete.product_id)
      );

      setListingToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(
        `${apiUrl}/listing_api/listings/export/${format}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const formatName = format.split(".")[0];
      link.setAttribute(
        "download",
        `listings_${formatName}_${new Date().toISOString().split("T")[0]}.${format
          .split(".")
          .pop()}`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportMenu(false);
    } catch (err) {
      console.error("Error exporting listings:", err);
      alert("Failed to export listings. Please try again.");
    }
  };

  const exportOptions = [
    { label: "Shopify (CSV)", value: "shopify.csv" },
    { label: "Amazon (TSV)", value: "amazon.tsv" },
    { label: "Flipkart (Excel)", value: "flipkart.xlsx" },
    { label: "Myntra (CSV)", value: "myntra.csv" },
  ];

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "inactive":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "active")
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    if (s === "inactive")
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  };

  const getStockBadge = (qty) => {
    const q = Number(qty || 0);
    if (q > 10) return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    if (q > 0) return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  };

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.item_sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        listing.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [listings, searchTerm, statusFilter]);

  const totalListings = listings.length;
  const activeListings = listings.filter(
    (l) => l.status?.toLowerCase() === "active"
  ).length;
  const inactiveListings = listings.filter(
    (l) => l.status?.toLowerCase() === "inactive"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-6 lg:p-8">
      {/* Delete Modal */}
      {showDeleteModal && listingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelDelete}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  Delete listing?
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  This action can’t be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="font-medium text-rose-900 line-clamp-2">
                {listingToDelete.title}
              </p>
              <div className="mt-2 text-sm text-rose-800 space-y-1">
                <p>SKU: {listingToDelete.item_sku}</p>
                <p>
                  Price: $
                  {parseFloat(listingToDelete.standard_price || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deletingId === listingToDelete.product_id}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId === listingToDelete.product_id}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {deletingId === listingToDelete.product_id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Product Listings
                  </h1>
                  <p className="text-slate-600 text-sm mt-0.5">
                    Search, filter, export and manage your catalog.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white font-semibold shadow-sm hover:bg-slate-800"
              >
                <Plus className="w-5 h-5" />
                Create Listing
              </Link>

              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu((v) => !v)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-slate-800 font-semibold shadow-sm hover:bg-slate-50"
                >
                  <Download className="w-5 h-5" />
                  Export
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showExportMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-20">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Export as
                      </p>
                    </div>
                    <div className="py-1">
                      {exportOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleExport(opt.value)}
                          className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <Download className="w-4 h-4 text-slate-400" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Total</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {totalListings}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Active</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {activeListings}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Inactive</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {inactiveListings}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Showing</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {filteredListings.length}
            </p>
          </div>
        </div>

        {/* Main */}
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Loading listings...</span>
            </div>
            <div className="mt-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-rose-900">
                  Error loading listings
                </h3>
                <p className="text-rose-800 mt-1 text-sm">{error}</p>
                <button
                  onClick={fetchListings}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-900"
                >
                  <AlertCircle className="w-4 h-4" />
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              {searchTerm || statusFilter !== "all"
                ? "No matching listings"
                : "No listings yet"}
            </h3>
            <p className="mt-2 text-slate-600 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "Try changing your search keywords or filters."
                : "Create your first product listing to start managing your catalog."}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-white z-10 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredListings.map((listing) => (
                    <tr
                      key={listing.product_id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        deletingId === listing.product_id ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900/5 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-700">
                              {listing.title?.slice(0, 2)?.toUpperCase() || "PR"}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate max-w-[22rem]">
                              {listing.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>ID: {listing.product_id}</span>
                              <button
                                onClick={() => handleView(listing.product_id)}
                                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {listing.item_sku}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          ${parseFloat(listing.standard_price || 0).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStockBadge(
                            listing.quantity
                          )}`}
                        >
                          {listing.quantity}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                            listing.status
                          )}`}
                        >
                          {getStatusIcon(listing.status)}
                          {listing.status || "Unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(listing.product_id)}
                            disabled={deletingId === listing.product_id}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden md:inline">View</span>
                          </button>

                          <button
                            onClick={() => handleEdit(listing.product_id)}
                            disabled={deletingId === listing.product_id}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="hidden md:inline">Edit</span>
                          </button>

                          <button
                            onClick={() => confirmDelete(listing)}
                            disabled={deletingId === listing.product_id}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === listing.product_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            <span className="hidden md:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {filteredListings.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {listings.length}
                </span>
              </p>

              <button
                onClick={() => handleExport("shopify.csv")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsTable;
