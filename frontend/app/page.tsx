"use client";

import { useState } from "react";
import Papa from "papaparse";

type CRMRecord = {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
};

type UploadResponse = {
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
  records: CRMRecord[];
};

function getStatusStyle(status: string): string {
  switch (status) {
    case "GOOD_LEAD_FOLLOW_UP": return "bg-green-100 text-green-700";
    case "SALE_DONE": return "bg-blue-100 text-blue-700";
    case "DID_NOT_CONNECT": return "bg-gray-100 text-gray-600";
    case "BAD_LEAD": return "bg-red-100 text-red-600";
    default: return "bg-gray-50 text-gray-400";
  }
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("AI is processing your leads...");
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(selectedFile: File) {
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a valid .csv file.");
      return;
    }
    setFile(selectedFile);
    setResult(null);
    setError(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        setPreviewRows(rows);
        if (rows.length > 0) {
          setPreviewHeaders(Object.keys(rows[0]));
        }
      },
    });
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }

  async function handleConfirm() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setLoadingMessage("Uploading file...");

    const messageTimer = setTimeout(() => {
      setLoadingMessage("AI is mapping your leads, this may take a minute for large files...");
    }, 3000);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      const res = await fetch("https://groweasy-csv-importer-ukip.onrender.com/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      const data: UploadResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. The server may be waking up — please try again in 30 seconds.");
      } else {
        setError(err.message || "Something went wrong");
      }
    } finally {
      clearTimeout(messageTimer);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          GrowEasy CRM CSV Importer
        </h1>
        <p className="text-gray-500 mb-6">
          Upload any CSV — AI will intelligently map it to GrowEasy CRM format
        </p>

        {!file && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-white hover:border-blue-400 transition-colors"
          >
            <p className="text-gray-600 mb-4">
              Drag & drop your CSV file here, or click to select
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose File
            </label>
            <p className="text-xs text-gray-400 mt-3">
              Supports any CSV format — Facebook Ads, Google Ads, Excel exports, and more
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {file && previewRows.length > 0 && !result && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Preview: {file.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {previewRows.length} rows · {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewRows([]);
                    setError(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Import"}
                </button>
              </div>
            </div>

            <div className="border rounded-xl overflow-auto max-h-[500px] bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 border-b">
                  <tr>
                    {previewHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      {previewHeaders.map((header) => (
                        <td
                          key={header}
                          className="px-4 py-2 text-gray-600 whitespace-nowrap"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-center text-blue-700">
            <div className="animate-pulse">{loadingMessage}</div>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <div className="flex gap-4 mb-4">
              <div className="bg-white rounded-lg shadow-sm px-4 py-3 border">
                <p className="text-sm text-gray-500">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900">{result.totalRows}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm px-4 py-3 border">
                <p className="text-sm text-gray-500">Imported</p>
                <p className="text-2xl font-bold text-green-600">{result.totalImported}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm px-4 py-3 border">
                <p className="text-sm text-gray-500">Skipped</p>
                <p className="text-2xl font-bold text-red-500">{result.totalSkipped}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                Imported Records
              </h2>
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewRows([]);
                  setResult(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Upload Another File
              </button>
            </div>

            <div className="border rounded-xl overflow-auto max-h-[500px] bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 border-b">
                  <tr>
                    {Object.keys(result.records[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.records.map((record, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      {Object.entries(record).map(([key, value], j) => (
                        <td
                          key={j}
                          className="px-4 py-2 text-gray-600 whitespace-nowrap"
                        >
                          {key === "crm_status" && value ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(String(value))}`}>
                              {String(value)}
                            </span>
                          ) : (
                            String(value)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}