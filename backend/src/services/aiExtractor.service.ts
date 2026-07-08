import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { CRM_EXTRACTION_PROMPT } from "../prompts/crmExtraction.prompt";
import { CRMRecord } from "../types/crm.types";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function extractCRMRecords(
  rows: Record<string, any>[]
): Promise<CRMRecord[]> {
  const fullPrompt = CRM_EXTRACTION_PROMPT + JSON.stringify(rows, null, 2);

  const result = await model.generateContent(fullPrompt);
  const responseText = result.response.text();

  const cleaned = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error("AI response was not a JSON array");
    }
    return parsed as CRMRecord[];
  } catch (err) {
    console.error("Failed to parse AI response:", cleaned);
    throw new Error("AI returned invalid JSON");
  }
}