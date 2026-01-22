import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
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
    }).format(value || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Listing Creator</h1>
          <p className="text-gray-600">Create and manage your product listings in 3 simple steps</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="relative z-20 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= stepNum 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}>
                  {step > stepNum ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="font-bold">{stepNum}</span>
                  )}
                </div>
                <span className={`mt-3 font-medium text-sm ${
                  step >= stepNum ? "text-blue-600" : "text-gray-500"
                }`}>
                  {stepNum === 1 && "Upload Images"}
                  {stepNum === 2 && "Product Details"}
                  {stepNum === 3 && "Complete"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Step 1: Upload Images */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Product Images</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Upload high-quality images of your product. The AI will analyze these images to generate detailed product information.
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div
                    {...getRootProps()}
                    className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-blue-50/50"
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">Drag & drop images here</p>
                        <p className="text-gray-600 mt-1">or click to browse files</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Supports: JPEG, JPG, PNG, WEBP • Maximum 10 files
                      </p>
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Selected Images <span className="text-blue-600">({files.length})</span>
                        </h3>
                        <button
                          onClick={() => setFiles([])}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Clear All</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {files.map((file, index) => (
                          <div key={file.name} className="relative group rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(index);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            </div>
                            <div className="p-3">
                              <p className="text-xs text-gray-600 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Product Details Form */}
            {step === 2 && (
              <div className="space-y-10">
                <div className="text-center mb-2">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Product Details</h2>
                  <p className="text-gray-600">
                    Review and edit the AI-generated product information. All fields marked with * are required.
                  </p>
                </div>

                <div className="space-y-8 max-w-6xl mx-auto">
                  {/* Basic Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-1">
                    <div className="bg-white rounded-xl p-8">
                      <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Product ID Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="product_id_type"
                              value={formData.product_id_type}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                              <option value="ASIN">ASIN</option>
                              <option value="UPC">UPC</option>
                              <option value="EAN">EAN</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Item SKU <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="item_sku"
                              value={formData.item_sku}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Brand <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="brand"
                              value={formData.brand}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Product Type <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="product_type"
                              value={formData.product_type}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              value={formData.quantity}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              min="0"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              rows="4"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-4">
                          Bullet Points (5 max) <span className="font-normal text-gray-500">- Key selling points</span>
                        </label>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {formData.bullet_points.map((point, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <span className="mt-3 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <input
                                type="text"
                                value={point}
                                onChange={(e) => handleBulletPointChange(index, e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder={`Enter bullet point ${index + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-1">
                    <div className="bg-white rounded-xl p-8">
                      <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Pricing</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Standard Price (INR) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                              type="number"
                              name="standard_price"
                              value={formData.standard_price}
                              onChange={handleInputChange}
                              step="0.01"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Sale Price (INR) <span className="text-gray-500">(Optional)</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                              type="number"
                              name="sale_price"
                              value={formData.sale_price}
                              onChange={handleInputChange}
                              step="0.01"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category & Classification */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-1">
                    <div className="bg-white rounded-xl p-8">
                      <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Category & Classification</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="department_name"
                            value={formData.department_name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <option value="womens">Womens</option>
                            <option value="mens">Mens</option>
                            <option value="kids">Kids</option>
                            <option value="unisex">Unisex</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Material Type <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="material_type"
                            value={formData.material_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                            placeholder="e.g., Metal, Sterling Silver, Gold"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Metal Type <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="metal_type"
                            value={formData.metal_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Metal Stamp <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="metal_stamp"
                            value={formData.metal_stamp}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                            placeholder="e.g., 925, 10K, 14K"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Gem Type <span className="text-gray-500">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            name="gem_type"
                            value={formData.gem_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Material Categorisation <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="jewellery_material_categorisation"
                            value={formData.jewellery_material_categorisation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                            placeholder="e.g., Fine, Fashion, Imitation"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Specifics */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-1">
                    <div className="bg-white rounded-xl p-8">
                      <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Product Specifics</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Ring Size
                          </label>
                          <input
                            type="number"
                            name="ring_size"
                            value={formData.ring_size}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Ring Sizing System
                          </label>
                          <input
                            type="text"
                            name="ring_sizing_system"
                            value={formData.ring_sizing_system}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Back Finding
                          </label>
                          <input
                            type="text"
                            name="back_finding"
                            value={formData.back_finding}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="e.g., Push Back, Screw Back"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Chain Type
                          </label>
                          <input
                            type="text"
                            name="chain_type"
                            value={formData.chain_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="e.g., Box Chain, Rope Chain"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Clasp Type
                          </label>
                          <input
                            type="text"
                            name="clasp_type"
                            value={formData.clasp_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="e.g., Lobster Claw, Spring Ring"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Bracelet Style
                          </label>
                          <input
                            type="text"
                            name="bracelet_style"
                            value={formData.bracelet_style}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="e.g., Bangle, Cuff, Tennis Bracelet"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-1">
                    <div className="bg-white rounded-xl p-8">
                      <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Additional Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Occasion
                          </label>
                          <input
                            type="text"
                            name="ocassion"
                            value={formData.ocassion}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            placeholder="e.g., Casual, Formal, Party"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Trend
                          </label>
                          <input
                            type="text"
                            name="trend"
                            value={formData.trend}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            placeholder="e.g., Vintage, Modern, Bohemian"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            HSN Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="hsn_code"
                            value={formData.hsn_code}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Weight (grams) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Length (cm) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="length"
                            value={formData.length}
                            onChange={handleInputChange}
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Width (cm) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="width"
                            value={formData.width}
                            onChange={handleInputChange}
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Height (cm) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Material Care Instructions <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="material_care"
                          value={formData.material_care}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status & Logistics */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl p-1">
                    <div className="bg-white rounded-xl p-8">
                      <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Status & Logistics</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Fulfilled By
                          </label>
                          <select
                            name="fullfilled_by"
                            value={formData.fullfilled_by}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                          >
                            <option value="merchant">Merchant</option>
                            <option value="amazon">Amazon</option>
                            <option value="seller">Seller</option>
                            <option value="flipkart">Flipkart</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Procurement Type
                          </label>
                          <select
                            name="procurement_type"
                            value={formData.procurement_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                          >
                            <option value="express">Express</option>
                            <option value="in_stock">In Stock</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {step === 3 && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Form Submitted Successfully!</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Your product listing has been created and is now live. You can view it in your dashboard.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-1 shadow-lg">
                  <div className="bg-white rounded-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">Submission Summary</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Left Column */}
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Basic Information</h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Title</p>
                              <p className="font-medium text-gray-900">{formData.title}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Product Type</p>
                              <p className="font-medium text-gray-900">{formData.product_type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Brand</p>
                              <p className="font-medium text-gray-900">{formData.brand}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">SKU</p>
                              <p className="font-medium text-gray-900">{formData.item_sku}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Quantity</p>
                              <p className="font-medium text-gray-900">{formData.quantity} units</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Department</p>
                              <p className="font-medium text-gray-900 capitalize">{formData.department_name}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Materials</h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Material Type</p>
                              <p className="font-medium text-gray-900">{formData.material_type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Metal Type</p>
                              <p className="font-medium text-gray-900">{formData.metal_type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Metal Stamp</p>
                              <p className="font-medium text-gray-900">{formData.metal_stamp}</p>
                            </div>
                            {formData.gem_type && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Gem Type</p>
                                <p className="font-medium text-gray-900">{formData.gem_type}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Pricing & Dimensions</h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Standard Price</p>
                              <p className="text-xl font-bold text-green-600">{formatCurrency(formData.standard_price)}</p>
                            </div>
                            {formData.sale_price && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Sale Price</p>
                                <p className="text-lg font-semibold text-red-600">{formatCurrency(formData.sale_price)}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Weight</p>
                              <p className="font-medium text-gray-900">{formData.weight} grams</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Dimensions</p>
                              <p className="font-medium text-gray-900">{formData.length} × {formData.width} × {formData.height} cm</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Additional Details</h4>
                          <div className="space-y-4">
                            {formData.ocassion && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Occasion</p>
                                <p className="font-medium text-gray-900">{formData.ocassion}</p>
                              </div>
                            )}
                            {formData.trend && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Trend</p>
                                <p className="font-medium text-gray-900">{formData.trend}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-500 mb-1">HSN Code</p>
                              <p className="font-medium text-gray-900">{formData.hsn_code}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Images Uploaded</p>
                              <p className="font-medium text-gray-900">{uploadedImages.length} images</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bullet Points */}
                    {formData.bullet_points.filter(p => p.trim() !== "").length > 0 && (
                      <div className="mt-10 pt-8 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Bullet Points</h4>
                        <ul className="space-y-3">
                          {formData.bullet_points
                            .filter(p => p.trim() !== "")
                            .map((point, index) => (
                              <li key={index} className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                                  {index + 1}
                                </div>
                                <span className="text-gray-700">{point}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {/* Description */}
                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Description</h4>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{formData.description}</p>
                      </div>
                    </div>

                    {/* Material Care */}
                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Material Care Instructions</h4>
                      <div className="bg-blue-50 rounded-xl p-6">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{formData.material_care}</p>
                      </div>
                    </div>

                    {/* Images Preview */}
                    {uploadedImages.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-6">Uploaded Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {uploadedImages.map((url, index) => (
                            <div key={index} className="relative group rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                              <img
                                src={url}
                                alt={`Product ${index + 1}`}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {index === 0 ? "Main" : `Extra ${index}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              {step > 1 && step < 3 && (
                <button
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous Step</span>
                </button>
              )}
              
              {step < 3 && (
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className={`ml-auto px-10 py-3 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 ${
                    step === 1 
                      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" 
                      : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : step === 2 ? (
                    <>
                      <span>Submit Listing</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Continue to Details</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
              
              {step === 3 && (
                <div className="flex space-x-4 ml-auto">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create New Listing</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print Summary</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Need help? Contact our support team at support@jewelryplatform.com</p>
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;
