import PDFParser from "pdf2json";
import * as mammoth from "mammoth";

/**
 * Extracts raw text from PDF or DOCX buffer for AI parsing.
 * - For PDF: uses pdf2json for best structure preservation
 * - For DOCX: uses mammoth
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractPdfText(buffer);
  } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractDocxText(buffer);
  } else {
    throw new Error("Unsupported file type");
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataReady", (data) => {
      const text = data.Pages.map((page) => {
        const lineMap = new Map<number, Array<{ x: number; text: string }>>();
        page.Texts.forEach((item) => {
          const y = Math.round(item.y * 5) / 5;
          if (!lineMap.has(y)) lineMap.set(y, []);
          const rawText = item.R[0].T;
          const decodedText = decodeURIComponent(rawText);
          lineMap.get(y)!.push({ x: item.x, text: decodedText });
        });
        const sortedLines = Array.from(lineMap.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([_, items]) => items.sort((a, b) => a.x - b.x).map((item) => item.text).join(" "))
          .filter((line) => line.trim());
        return sortedLines.join("\n");
      }).join("\n\n");
      resolve(text);
    });
    pdfParser.on("pdfParser_dataError", (error) => {
      reject(new Error("Failed to parse PDF file"));
    });
    pdfParser.parseBuffer(buffer);
  });
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
