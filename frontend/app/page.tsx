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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(selectedFile: File) {
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
    if (droppedFile && droppedFile.type === "text/csv") {
      handleFileSelect(droppedFile);
    } else {
      setError("Please upload a valid CSV file.");
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

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://groweasy-csv-importer-ukip.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      const data: UploadResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          GrowEasy CRM CSV Importer
        </h1>

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
              <h2 className="text-xl font-semibold text-gray-800">
                Preview: {file.name} ({previewRows.length} rows)
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewRows([]);
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
          <div className="mt-6 text-center text-gray-600">
            AI is processing your leads, please wait...
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
              <h2 className="text-xl font-semibold text-gray-800">Imported Records</h2>
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
                      {Object.values(record).map((value, j) => (
                        <td
                          key={j}
                          className="px-4 py-2 text-gray-600 whitespace-nowrap"
                        >
                          {String(value)}
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