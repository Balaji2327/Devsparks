// src/components/BarcodeScanner.tsx
import React, { useState, useRef } from "react";
import {
  Scan,
  Upload,
  Search,
  Package2,
  Camera,
  AlertCircle,
} from "lucide-react";

// Type definitions
interface ProductInfo {
  barcode: string;
  productName: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
  image: string | null;
  upc: string | null;
  ean: string | null;
  found: boolean;
  error?: string;
  message?: string;
}

interface ScanResult {
  found: boolean;
  barcode?: string;
  type?: string;
  productInfo?: ProductInfo;
  error?: string;
  message?: string;
}

type ActiveTab = "upload" | "manual";

const BarcodeScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualBarcode, setManualBarcode] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setScanResult(null);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const scanBarcodeFromImage = async (): Promise<void> => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("lookup", "true");

      const response = await fetch("/api/barcode/decode", {
        method: "POST",
        body: formData,
      });

      const data: ScanResult = await response.json();
      setScanResult(data);
    } catch (error) {
      console.error("Barcode scan failed:", error);
      setScanResult({
        found: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const lookupManualBarcode = async (): Promise<void> => {
    if (!manualBarcode.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await fetch(
        `/api/barcode/lookup/${manualBarcode.trim()}`
      );
      const data: ProductInfo = await response.json();
      setScanResult({
        found: data.found,
        barcode: manualBarcode,
        productInfo: data,
      });
    } catch (error) {
      console.error("Barcode lookup failed:", error);
      setScanResult({
        found: false,
        barcode: manualBarcode,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const renderScanResult = (): JSX.Element | null => {
    if (!scanResult) return null;

    return (
      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <Package2 className="h-5 w-5 mr-2 text-blue-600" />
          Scan Result
        </h3>

        {scanResult.found ? (
          <div className="space-y-4">
            {/* Barcode */}
            <div className="bg-gray-50 p-3 rounded-md">
              <label className="text-sm font-medium text-gray-600">
                Detected Barcode:
              </label>
              <div className="text-lg font-mono mt-1 text-blue-600">
                {scanResult.barcode}
              </div>
            </div>

            {/* Product Information */}
            {scanResult.productInfo && scanResult.productInfo.found ? (
              <div className="border border-green-200 bg-green-50 p-4 rounded-md">
                <h4 className="font-medium text-green-800 mb-3 flex items-center">
                  <Package2 className="h-4 w-4 mr-2" />
                  Product Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scanResult.productInfo.image && (
                    <div className="md:col-span-2">
                      <img
                        src={`/api/proxy-image?url=${encodeURIComponent(
                          scanResult.productInfo.image
                        )}`}
                        alt={scanResult.productInfo.productName || "Product"}
                        className="w-32 h-32 object-cover rounded-md border border-gray-200"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div>
                      <strong className="text-gray-700">Product Name:</strong>
                      <div className="text-gray-900">
                        {scanResult.productInfo.productName || "N/A"}
                      </div>
                    </div>
                    <div>
                      <strong className="text-gray-700">Brand:</strong>
                      <div className="text-gray-900">
                        {scanResult.productInfo.brand || "N/A"}
                      </div>
                    </div>
                    <div>
                      <strong className="text-gray-700">Category:</strong>
                      <div className="text-gray-900">
                        {scanResult.productInfo.category || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <strong className="text-gray-700">UPC:</strong>
                      <div className="font-mono text-gray-900">
                        {scanResult.productInfo.upc || "N/A"}
                      </div>
                    </div>
                    <div>
                      <strong className="text-gray-700">EAN:</strong>
                      <div className="font-mono text-gray-900">
                        {scanResult.productInfo.ean || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {scanResult.productInfo.description && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <strong className="text-gray-700">Description:</strong>
                    <div className="text-gray-900 mt-1">
                      {scanResult.productInfo.description}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">
                    Barcode detected but product information not found in
                    database
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-red-200 bg-red-50 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-red-800">
                {scanResult.error ||
                  scanResult.message ||
                  "No barcode detected"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Scan className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Barcode Scanner
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => setActiveTab("upload")}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  activeTab === "upload"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  activeTab === "manual"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <Search className="h-4 w-4" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "upload" ? (
            <div className="space-y-6">
              {/* Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Barcode Image
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-lg p-6"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="text-center">
                      <img
                        src={previewUrl}
                        alt="Selected barcode"
                        className="max-w-xs max-h-64 mx-auto rounded-md shadow-sm"
                      />
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          {selectedFile?.name} (
                          {selectedFile ? (selectedFile.size / 1024).toFixed(1) : "0"} KB)
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Choose Different Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          Drop barcode image here or
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Select Image
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Supports JPG, PNG, WebP formats
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Scan Button */}
              {selectedFile && (
                <button
                  onClick={scanBarcodeFromImage}
                  disabled={isScanning}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors
                    ${
                      isScanning
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }
                  `}
                >
                  <Scan
                    className={`h-5 w-5 ${isScanning ? "animate-spin" : ""}`}
                  />
                  <span>{isScanning ? "Scanning..." : "Scan Barcode"}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Manual Entry */}
              <div>
                <label
                  htmlFor="barcode-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter Barcode Number
                </label>
                <div className="flex space-x-2">
                  <input
                    id="barcode-input"
                    type="text"
                    value={manualBarcode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setManualBarcode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter 8-14 digit barcode (UPC/EAN)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={14}
                  />
                  <button
                    onClick={lookupManualBarcode}
                    disabled={isScanning || !manualBarcode.trim()}
                    className={`
                      flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-colors
                      ${
                        isScanning || !manualBarcode.trim()
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }
                    `}
                  >
                    <Search
                      className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`}
                    />
                    <span>{isScanning ? "Looking up..." : "Lookup"}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter UPC, EAN-13, EAN-8, or other standard barcodes
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {renderScanResult()}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;