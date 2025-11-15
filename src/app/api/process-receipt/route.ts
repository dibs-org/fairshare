import { NextRequest, NextResponse } from "next/server";
import { parseReceiptText } from "@/lib/parseReceipt";

interface OCRSpaceResponse {
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string[];
  ParsedResults?: Array<{
    ParsedText: string;
  }>;
  OCRExitCode: number;
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    console.log("Processing receipt with OCR...");

    // Extract base64 data (remove data:image/...;base64, prefix)
    const base64Data = image.split(',')[1] || image;

    // Create FormData for OCR.Space API
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Data}`);
    formData.append('language', 'eng');
    formData.append('isTable', 'true'); // Receipt/table mode for better line-item extraction
    formData.append('OCREngine', '2'); // Engine 2 for better accuracy
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true'); // Upscale for better quality

    // Use OCR.Space free API
    const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld'; // Free tier fallback
    const apiUrl = 'https://api.ocr.space/parse/image';

    const ocrResponse = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'apikey': apiKey
      }
    });

    if (!ocrResponse.ok) {
      throw new Error(`OCR API error: ${ocrResponse.status}`);
    }

    const ocrResult: OCRSpaceResponse = await ocrResponse.json();

    if (ocrResult.IsErroredOnProcessing) {
      throw new Error(ocrResult.ErrorMessage?.join('; ') || 'OCR processing failed');
    }

    const extractedText = ocrResult.ParsedResults?.[0]?.ParsedText || '';
    
    console.log('Extracted text from receipt:', extractedText);

    if (!extractedText || extractedText.length < 10) {
      throw new Error('Could not extract text from receipt. Please ensure the image is clear and well-lit.');
    }

    // Parse the extracted text into structured receipt data
    const receiptData = parseReceiptText(extractedText);

    if (receiptData.items.length === 0) {
      throw new Error('No items found on receipt. Please ensure the receipt is clearly visible and try again.');
    }

    console.log('Receipt processed successfully:', receiptData);

    return NextResponse.json(receiptData);
  } catch (error) {
    console.error("Error processing receipt:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}