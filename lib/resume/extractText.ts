import PDFParser from "pdf2json";
import * as mammoth from "mammoth";

/**
 * PHASE 3: TEXT EXTRACTION (NO AI YET)
 * Rules:
 * - Preserve line breaks
 * - Preserve bullet symbols
 * - Normalize whitespace
 * - No AI parsing here
 */


export async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataReady", (data) => {
      // Extract text with better structure preservation
      const text = data.Pages.map((page) => {
        // Group text items by Y position (vertical line) for better readability
        const lineMap = new Map<number, Array<{ x: number; text: string }>>();

        page.Texts.forEach((item) => {
          // Use tolerance of 0.2 to group text items that are close vertically
          const y = Math.round(item.y * 5) / 5; // Round to nearest 0.2 for better grouping
          if (!lineMap.has(y)) {
            lineMap.set(y, []);
          }
          const rawText = item.R[0].T;
          const decodedText = decodeURIComponent(rawText);
          console.log(`[PDF Extract] Y=${y.toFixed(2)}, X=${item.x.toFixed(2)}, Raw="${rawText}" → Decoded="${decodedText}"`);
          lineMap.get(y)!.push({
            x: item.x,
            text: decodedText,
          });
        });

        // Sort by Y position (top to bottom) and join with line breaks
        const sortedLines = Array.from(lineMap.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([_, items]) => {
            // Sort items on same line by X position (left to right)
            // Join items on same line with space - simpler approach
            return items.sort((a, b) => a.x - b.x)
              .map((item) => item.text)
              .join(" "); // Always join with space
          })
          .filter((line) => line.trim()); // Remove empty lines

        return sortedLines.join("\n");
      }).join("\n\n"); // Double newlines between pages

      resolve(text);
    });

    pdfParser.on("pdfParser_dataError", (error) => {
      console.error("PDF parsing error:", error);
      reject(new Error("Failed to parse PDF file"));
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX file");
  }
}

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractPdfText(buffer);
  } else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(buffer);
  } else {
    throw new Error("Unsupported file type");
  }
}
