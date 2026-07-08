import express from "express";
import cors from "cors";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { createBatches } from "./services/batching.service";
import { extractCRMRecords } from "./services/aiExtractor.service";
import { CRMRecord } from "./types/crm.types";

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Step 1: Parse CSV into raw JSON rows
    const rawRows = parse<Record<string, any>>(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (rawRows.length === 0) {
      return res.status(400).json({ error: "CSV file is empty" });
    }

    // Step 2: Split into batches of 25 rows
    const batches = createBatches(rawRows, 15);

    // Step 3: Send each batch to AI, collect results
    let allRecords: CRMRecord[] = [];

    for (let i = 0; i < batches.length; i++) {
  const extracted = await extractCRMRecords(batches[i]);
  allRecords = allRecords.concat(extracted);
  if (i < batches.length - 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

    // Step 4: Build response summary
    res.json({
      totalRows: rawRows.length,
      totalImported: allRecords.length,
      totalSkipped: rawRows.length - allRecords.length,
      records: allRecords,
    });
  } catch (err: any) {
    console.error("Upload processing failed:", err.message);
    res.status(500).json({ error: "Failed to process CSV", details: err.message });
  }
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});