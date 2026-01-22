import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    // Basic Information
    product_id_type: "ASIN",
    title: "",
    description: "",
    product_type: "",
    bullet_points: ["", "", "", "", ""],
    item_sku: "",
    quantity: 0,
    brand: "",
    standard_price: "",
    sale_price: "",
    
    // Images (will be populated from API)
    main_image_url: "",
    additional_image_urls: [],
    
    // Category & Classification
    department_name: "womens",
    material_type: "",
    metal_type: "",
    metal_stamp: "",
    gem_type: "",
    jewellery_material_categorisation: "",
    
    // Product Specifics
    ring_size: 0,
    ring_sizing_system: "India",
    back_finding: "",
    chain_type: "",
    clasp_type: "",
    bracelet_style: "",
    
    // Status & Logistics
    status: "pending",
    fullfilled_by: "merchant",
    procurement_type: "in_stock",
    
    // Additional Details
    ocassion: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    hsn_code: "",
    trend: "",
    material_care: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);

  // Handle image upload with React Dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
  });

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle bullet points change
  const handleBulletPointChange = (index, value) => {
    const newBulletPoints = [...formData.bullet_points];
    newBulletPoints[index] = value;
    setFormData((prev) => ({
      ...prev,
      bullet_points: newBulletPoints,
    }));
  };

  // Upload images to the backend and get generated data
  const uploadImages = async () => {
    if (files.length === 0) {
      setError("Please upload at least one image");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      files.forEach((file) => {
        uploadFormData.append("images", file);
      });

      const response = await axios.post(
        "http://167.99.97.126/listing_api/images/",
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Images uploaded successfully:", response.data);
      
      // Store the generated data from API
      setGeneratedData(response.data);
      
      // Populate form with generated data
      if (response.data.listing) {
        const listingData = response.data.listing;
        setFormData(prev => ({
          ...prev,
          title: listingData.title || "",
          description: listingData.description || "",
          product_type: listingData.product_type || "",
          bullet_points: listingData.bullet_points || ["", "", "", "", ""],
          quantity: listingData.quantity || 0,
          brand: listingData.brand || "",
          department_name: listingData.department_name || "womens",
          material_type: listingData.material_type || "",
          metal_type: listingData.metal_type || "",
          metal_stamp: listingData.metal_stamp || "",
          gem_type: listingData.gem_type || "",
          jewellery_material_categorisation: listingData.jewellery_material_categorisation || "",
          ring_size: listingData.ring_size || 0,
          ring_sizing_system: listingData.ring_sizing_system || "India",
          back_finding: listingData.back_finding || "",
          chain_type: listingData.chain_type || "",
          clasp_type: listingData.clasp_type || "",
          bracelet_style: listingData.bracelet_style || "",
          status: listingData.status || "pending",
          fullfilled_by: listingData.fullfilled_by || "merchant",
          procurement_type: listingData.procurement_type || "in_stock",
          ocassion: listingData.ocassion || "",
          weight: listingData.weight || "",
          length: listingData.length || "",
          width: listingData.width || "",
          height: listingData.height || "",
          trend: listingData.trend || "",
          material_care: listingData.material_care || "",
          main_image_url: response.data.main_image_url || "",
          additional_image_urls: response.data.extra_image_urls || []
        }));
      }

      setUploadedImages([response.data.main_image_url, ...(response.data.extra_image_urls || [])]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload images");
      console.error("Upload error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Submit the entire form
  const submitForm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Filter out empty bullet points
      const filteredBulletPoints = formData.bullet_points.filter(point => point.trim() !== "");
      
      const payload = {
        ...formData,
        bullet_points: filteredBulletPoints,
        quantity: parseInt(formData.quantity) || 0,
        ring_size: parseInt(formData.ring_size) || 0,
        standard_price: parseFloat(formData.standard_price) || 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        weight: parseFloat(formData.weight) || 0,
        length: parseFloat(formData.length) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        "http://167.99.97.126/listing_api/listings/",
        payload,
      );

      console.log("Form submitted successfully:", response.data);
      alert("Form submitted successfully!");
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit form");
      console.error("Form submission error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next step
  const handleNext = async () => {
    if (step === 1) {
      const success = await uploadImages();
      if (success) {
        setStep(2);
      }
    } else if (step === 2) {
      const success = await submitForm();
      if (success) {
        setStep(3);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Remove a file from the upload list
  const removeFile = (index) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex-1 text-center ${step >= 1 ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
          1. Upload Images
        </div>
        <div className="w-8 h-8 mx-4 flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
        <div className={`flex-1 text-center ${step >= 2 ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
          2. Product Details
        </div>
        <div className="w-8 h-8 mx-4 flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
        <div className={`flex-1 text-center ${step >= 3 ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
          3. Complete
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Step 1: Upload Images */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Upload Product Images</h2>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">Drag & drop images here, or click to select</p>
            <p className="text-sm text-gray-500 mt-2">
              Supports: JPEG, JPG, PNG, WEBP (Max 10 files)
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Selected Images ({files.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file, index) => (
                  <div key={file.name} className="relative group">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Product Details Form */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
          
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product ID Type *
                </label>
                <select
                  name="product_id_type"
                  value={formData.product_id_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ASIN">ASIN</option>
                  <option value="UPC">UPC</option>
                  <option value="EAN">EAN</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item SKU *
                </label>
                <input
                  type="text"
                  name="item_sku"
                  value={formData.item_sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type *
                </label>
                <input
                  type="text"
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bullet Points (5 max)
              </label>
              {formData.bullet_points.map((point, index) => (
                <input
                  key={index}
                  type="text"
                  value={point}
                  onChange={(e) => handleBulletPointChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder={`Bullet point ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard Price (INR) *
                </label>
                <input
                  type="number"
                  name="standard_price"
                  value={formData.standard_price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price (INR)
                </label>
                <input
                  type="number"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Category & Classification */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Category & Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="womens">Womens</option>
                  <option value="mens">Mens</option>
                  <option value="kids">Kids</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Type *
                </label>
                <input
                  type="text"
                  name="material_type"
                  value={formData.material_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Metal, Sterling Silver, Gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metal Type *
                </label>
                <input
                  type="text"
                  name="metal_type"
                  value={formData.metal_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metal Stamp *
                </label>
                <input
                  type="text"
                  name="metal_stamp"
                  value={formData.metal_stamp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., 925, 10K, 14K"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gem Type
                </label>
                <input
                  type="text"
                  name="gem_type"
                  value={formData.gem_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Categorisation *
                </label>
                <input
                  type="text"
                  name="jewellery_material_categorisation"
                  value={formData.jewellery_material_categorisation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Fine, Fashion, Imitation"
                />
              </div>
            </div>
          </div>

          {/* Product Specifics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Specifics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ring Size
                </label>
                <input
                  type="number"
                  name="ring_size"
                  value={formData.ring_size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ring Sizing System
                </label>
                <input
                  type="text"
                  name="ring_sizing_system"
                  value={formData.ring_sizing_system}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Back Finding
                </label>
                <input
                  type="text"
                  name="back_finding"
                  value={formData.back_finding}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Push Back, Screw Back"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chain Type
                </label>
                <input
                  type="text"
                  name="chain_type"
                  value={formData.chain_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Box Chain, Rope Chain"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clasp Type
                </label>
                <input
                  type="text"
                  name="clasp_type"
                  value={formData.clasp_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lobster Claw, Spring Ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bracelet Style
                </label>
                <input
                  type="text"
                  name="bracelet_style"
                  value={formData.bracelet_style}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bangle, Cuff, Tennis Bracelet"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occasion
                </label>
                <input
                  type="text"
                  name="ocassion"
                  value={formData.ocassion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Casual, Formal, Party"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trend
                </label>
                <input
                  type="text"
                  name="trend"
                  value={formData.trend}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Vintage, Modern, Bohemian"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HSN Code *
                </label>
                <input
                  type="text"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (grams) *
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length (cm) *
                </label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (cm) *
                </label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Care Instructions *
              </label>
              <textarea
                name="material_care"
                value={formData.material_care}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Status & Logistics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Status & Logistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fulfilled By
                </label>
                <select
                  name="fullfilled_by"
                  value={formData.fullfilled_by}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="merchant">Merchant</option>
                  <option value="amazon">Amazon</option>
                  <option value="seller">Seller</option>
                  <option value="flipkart">Flipkart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Procurement Type
                </label>
                <select
                  name="procurement_type"
                  value={formData.procurement_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="express">Express</option>
                  <option value="in_stock">In Stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Form Submitted Successfully!</h2>
            <p className="text-gray-600 mt-2">Thank you for submitting your product listing.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Submission Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Basic Information</h4>
                <p><span className="font-medium">Title:</span> {formData.title}</p>
                <p><span className="font-medium">Product Type:</span> {formData.product_type}</p>
                <p><span className="font-medium">Brand:</span> {formData.brand}</p>
                <p><span className="font-medium">SKU:</span> {formData.item_sku}</p>
                <p><span className="font-medium">Quantity:</span> {formData.quantity}</p>
                <p><span className="font-medium">Department:</span> {formData.department_name}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Pricing</h4>
                <p><span className="font-medium">Standard Price:</span> {formatCurrency(formData.standard_price)}</p>
                {formData.sale_price && (
                  <p><span className="font-medium">Sale Price:</span> {formatCurrency(formData.sale_price)}</p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Materials</h4>
                <p><span className="font-medium">Material Type:</span> {formData.material_type}</p>
                <p><span className="font-medium">Metal Type:</span> {formData.metal_type}</p>
                <p><span className="font-medium">Metal Stamp:</span> {formData.metal_stamp}</p>
                {formData.gem_type && (
                  <p><span className="font-medium">Gem Type:</span> {formData.gem_type}</p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Dimensions</h4>
                <p><span className="font-medium">Weight:</span> {formData.weight} grams</p>
                <p><span className="font-medium">Dimensions:</span> {formData.length} × {formData.width} × {formData.height} cm</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Bullet Points</h4>
              <ul className="list-disc pl-5 space-y-1">
                {formData.bullet_points.filter(p => p.trim() !== "").map((point, index) => (
                  <li key={index} className="text-gray-600">{point}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 whitespace-pre-line">{formData.description}</p>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Images Uploaded</h4>
              <p className="text-gray-600">{uploadedImages.length} images uploaded</p>
              {formData.main_image_url && (
                <div className="mt-2">
                  <p className="font-medium">Main Image:</p>
                  <img 
                    src={formData.main_image_url} 
                    alt="Main product" 
                    className="w-32 h-32 object-cover rounded-lg mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        {step > 1 && step < 3 && (
          <button
            onClick={handlePrevious}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Previous
          </button>
        )}
        
        {step < 3 && (
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : step === 2 ? "Submit" : "Next"}
          </button>
        )}
        
        {step === 3 && (
          <button
            onClick={() => window.location.reload()}
            className="ml-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Create New Listing
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
