import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { CRM_EXTRACTION_PROMPT } from "../prompts/crmExtraction.prompt";
import { CRMRecord } from "../types/crm.types";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callAIOnce(rows: Record<string, any>[]): Promise<CRMRecord[]> {
  const fullPrompt = CRM_EXTRACTION_PROMPT + JSON.stringify(rows, null, 2);
  const result = await model.generateContent(fullPrompt);
  const responseText = result.response.text();

  const cleaned = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error("AI response was not a JSON array");
  }
  return parsed as CRMRecord[];
}

export async function extractCRMRecords(
  rows: Record<string, any>[],
  maxRetries: number = 3
): Promise<CRMRecord[]> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callAIOnce(rows);
    } catch (err: any) {
      lastError = err;
      console.error(`AI batch attempt ${attempt} failed:`, err.message);

      if (attempt < maxRetries) {
        const backoffMs = attempt * 1000;
        await sleep(backoffMs);
      }
    }
  }

  throw new Error(
    `AI extraction failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}