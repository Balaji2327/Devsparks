import React, { useState } from "react";
import { Search, AlertTriangle, CheckCircle, X, ExternalLink } from "lucide-react";

/** ---------------- Types ---------------- */
type Violation = {
  field: string;
  status: "missing" | "partial" | "compliant";
  severity: "high" | "medium" | "none";
  description: string;
};

type ComplianceResult =
  | {
      productName: string;
      platform: string;
      complianceScore: number;
      violations: Violation[];
      recommendedActions: string[];
      productUrl: string;
      price?: number | null;
      brand?: string | null;
      rating?: number | null;
      ratingCount?: number | null;
      image?: string | null;
    }
  | null;

/** ---------------- Helpers ---------------- */
function splitUrlAndMode(raw: string): { cleanUrl: string; mode?: string } {
  try {
    const u = new URL(raw);
    const mode = u.searchParams.get("mode") || undefined;
    if (mode) u.searchParams.delete("mode"); // keep mode out of product URL
    return { cleanUrl: u.toString(), mode };
  } catch {
    return { cleanUrl: raw };
  }
}

/** Absolute API base (Fix A) */
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? "http://localhost:3001" : "/api");

/** Optional: enable sandbox automatically in dev (set VITE_SANDBOX=1 to force) */
const AUTO_SANDBOX =
  import.meta.env.DEV && import.meta.env.VITE_SANDBOX === "1";

/** ---------------- Component ---------------- */
const ComplianceChecker: React.FC = () => {
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<ComplianceResult>(null);

  const runFetch = async (finalUrl: string, forcedMode?: string) => {
    const { cleanUrl, mode } = splitUrlAndMode(finalUrl);
    const chosenMode = forcedMode || mode || (AUTO_SANDBOX ? "sandbox" : undefined);

    const apiUrl =
      `${API_BASE}/api/product-info?url=${encodeURIComponent(cleanUrl)}` +
      (chosenMode ? `&mode=${encodeURIComponent(chosenMode)}` : "");

    console.log("calling backend:", apiUrl);

    const r = await fetch(apiUrl);
    const data = await r.json();

    // If html path failed with 451 and we didn't force a mode, try Playwright
    if (!r.ok && r.status === 451 && !chosenMode) {
      const apiUrl2 = `${API_BASE}/api/product-info?url=${encodeURIComponent(
        cleanUrl
      )}&mode=browser`;
      console.log("retrying with browser:", apiUrl2);
      const r2 = await fetch(apiUrl2);
      const d2 = await r2.json();
      return { ok: r2.ok, data: d2 };
    }

    return { ok: r.ok, data };
  };

  const handleCheck = async (targetUrl?: string) => {
    const finalUrl = (targetUrl ?? url).trim();
    if (!finalUrl) return;

    setIsChecking(true);
    setResults(null);

    try {
      const { ok, data } = await runFetch(finalUrl);
      if (!ok) throw new Error(data?.error || "Failed to fetch");

      const validations = [
        { field: "Product Name", ok: !!data.productName },
        { field: "Brand", ok: !!data.brand },
        { field: "Price (MRP)", ok: !!data.price },
        { field: "Image", ok: !!data.image },
        { field: "Ratings", ok: !!data.rating },
      ];

      const complianceScore = Math.round(
        (validations.filter((v) => v.ok).length / validations.length) * 100
      );

      const violations: Violation[] = validations.map((v) => ({
        field: v.field,
        status: v.ok ? "compliant" : "missing",
        severity: v.ok ? "none" : "high",
        description: v.ok ? `${v.field} found` : `${v.field} not found on page`,
      }));

      setResults({
        productName: data.productName || "Unknown product",
        platform: data.platform || "Unknown",
        complianceScore,
        violations,
        recommendedActions: [
          !data.price && "Ensure MRP is explicitly displayed on the listing page",
          !data.brand && "Add manufacturer/packer/importer details",
          !data.image && "Provide clear front-of-pack image",
          !data.rating && "Encourage initial reviews to improve transparency",
        ].filter(Boolean) as string[],
        productUrl: data.url || finalUrl,
        price: data.price ?? null,
        brand: data.brand ?? null,
        rating: data.rating ?? null,
        ratingCount: data.ratingCount ?? null,
        image: data.image ?? null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setResults({
        productName: "Could not fetch details",
        platform: "Unknown",
        complianceScore: 0,
        violations: [
          {
            field: "Fetch",
            status: "missing",
            severity: "high",
            description: message,
          },
        ],
        recommendedActions: ["Verify URL/domain and try again."],
        productUrl: finalUrl,
        price: null,
        brand: null,
        rating: null,
        ratingCount: null,
        image: null,
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Compliance Checker</h2>
        <p className="text-gray-600 mt-1">
          Validate product listings against Legal Metrology requirements
        </p>
      </div>

      {/* URL Input */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product URL Analysis
        </h3>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="url"
              placeholder="Enter product URL (e.g., https://amazon.in/dp/ASIN)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => handleCheck()}
            disabled={!url || isChecking}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
          >
            <Search className="h-5 w-5" />
            <span>{isChecking ? "Analyzing..." : "Check Compliance"}</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tip: add <code>?mode=sandbox</code> to your product URL while testing. We’ll pass it to
          the backend correctly.
        </p>
      </div>

      {/* Quick Check Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {
            const u = "https://www.amazon.in/dp/B07WNS52H2?mode=sandbox";
            setUrl(u);
            handleCheck(u);
          }}
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <div className="text-left">
            <p className="font-medium text-gray-900">Sample Product #1</p>
            <p className="text-sm text-gray-600">NAKPRO Creatine – Amazon</p>
          </div>
        </button>
        <button
          onClick={() => {
            const u = "https://flipkart.com/p/itm-example?mode=sandbox";
            setUrl(u);
            handleCheck(u);
          }}
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <div className="text-left">
            <p className="font-medium text-gray-900">Sample Product #2</p>
            <p className="text-sm text-gray-600">Baby Food – Flipkart</p>
          </div>
        </button>
        <button
          onClick={() => {
            const u = "https://myntra.com/p/example?mode=sandbox";
            setUrl(u);
            handleCheck(u);
          }}
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <div className="text-left">
            <p className="font-medium text-gray-900">Sample Product #3</p>
            <p className="text-sm text-gray-600">Organic Tea – Myntra</p>
          </div>
        </button>
      </div>

      {/* Loading */}
      {isChecking && (
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyzing product compliance...</p>
            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p>• Extracting product information</p>
              <p>• Running OCR on product images</p>
              <p>• Validating against Legal Metrology rules</p>
              <p>• Generating compliance report</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && !isChecking && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {results.image && (
                  <img
                    src={results.image}
                    alt="product"
                    className="w-16 h-16 rounded object-cover border"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {results.productName}
                  </h3>
                  <p className="text-gray-600">
                    Platform: {results.platform}
                    {results.brand ? ` • Brand: ${results.brand}` : ""}
                    {typeof results.price === "number" ? ` • Price: ₹${results.price}` : ""}
                    {typeof results.rating === "number"
                      ? ` • Rating: ${results.rating}${
                          results.ratingCount ? ` (${results.ratingCount})` : ""
                        }`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Compliance Score</p>
                  <p
                    className={`text-2xl font-bold ${
                      results.complianceScore >= 80
                        ? "text-green-600"
                        : results.complianceScore >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {results.complianceScore}%
                  </p>
                </div>

                <a
                  href={results.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Product</span>
                </a>
              </div>
            </div>
          </div>

          {/* Compliance Details */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Compliance Check Results
            </h4>
            <div className="space-y-3">
              {results.violations.map((violation, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {violation.status === "compliant" ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : violation.status === "partial" ? (
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <X className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{violation.field}</p>
                    <p className="text-sm text-gray-600">{violation.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      violation.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : violation.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {violation.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Recommended Actions */}
            {results.recommendedActions.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Recommended Actions
                </h4>
                <div className="space-y-2">
                  {results.recommendedActions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <p className="text-gray-700">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Metrology Rules Reference */}
      <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-xl p-6 border border-orange-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Legal Metrology Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mandatory Declarations:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Name and address of manufacturer/packer/importer</li>
              <li>• Net quantity in standard units</li>
              <li>• Maximum Retail Price (MRP) inclusive of taxes</li>
              <li>• Consumer care details</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Additional Requirements:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Date of manufacture/import</li>
              <li>• Country of origin</li>
              <li>• Generic/common name of commodity</li>
              <li>• Dimensions for certain products</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceChecker;
