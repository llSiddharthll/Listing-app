import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./MultiStepForm.css";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    product_type: "",
    // Add other fields as needed
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Upload images to the backend
  const uploadImages = async () => {
    if (files.length === 0) {
      setError("Please upload at least one image");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post(
        "http://167.99.97.126/listing_api/images/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Images uploaded successfully:", response.data);

      setUploadedImages(response.data.images || []);
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
      const payload = {
        ...formData,
        main_image_url: uploadedImages[0] || "",
        extra_image_urls: uploadedImages.slice(1) || [],
      };

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
        // Form completed
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

  return (
    <div className="multi-step-form">
      <div className="progress-bar">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          1. Upload Images
        </div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          2. Product Details
        </div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>3. Complete</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {step === 1 && (
        <div className="step-content">
          <h2>Upload Product Images</h2>
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p>Drag & drop images here, or click to select</p>
            <p className="hint">
              Supports: JPEG, JPG, PNG, WEBP (Max 10 files)
            </p>
          </div>

          {files.length > 0 && (
            <div className="image-preview-container">
              <h3>Selected Images ({files.length})</h3>
              <div className="image-previews">
                {files.map((file, index) => (
                  <div key={file.name} className="image-preview">
                    <img src={file.preview} alt={file.name} />
                    <div className="image-info">
                      <span>{file.name}</span>
                      <button onClick={() => removeFile(index)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h2>Product Details</h2>
          <form className="product-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product_type">Product Type</label>
              <input
                type="text"
                id="product_type"
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Add more form fields as needed */}
          </form>
        </div>
      )}

      {step === 3 && (
        <div className="step-content">
          <h2>Form Submitted Successfully!</h2>
          <p>Thank you for submitting your product listing.</p>
          <div className="summary">
            <h3>Summary</h3>
            <p>
              <strong>Title:</strong> {formData.title}
            </p>
            <p>
              <strong>Description:</strong> {formData.description}
            </p>
            <p>
              <strong>Product Type:</strong> {formData.product_type}
            </p>
            <p>
              <strong>Images Uploaded:</strong> {uploadedImages.length}
            </p>
          </div>
        </div>
      )}

      <div className="form-navigation">
        {step > 1 && (
          <button onClick={handlePrevious} disabled={isLoading}>
            Previous
          </button>
        )}
        {step < 3 && (
          <button onClick={handleNext} disabled={isLoading}>
            {isLoading ? "Processing..." : step === 2 ? "Submit" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
