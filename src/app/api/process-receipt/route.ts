import { NextRequest, NextResponse } from "next/server";

interface OCRSpaceResponse {
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string[];
  ParsedResults?: Array<{
    ParsedText: string;
  }>;
  OCRExitCode: number;
}

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ReceiptData {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

function parseReceiptText(text: string): ReceiptData {
  const lines = text.split('\n').filter(line => line.trim());
  const items: ReceiptItem[] = [];
  let subtotal = 0;
  let tax = 0;
  let tip = 0;
  let total = 0;

  // Extract items with prices
  let itemCounter = 0;
  for (const line of lines) {
    // Skip total/tax/tip/subtotal lines
    if (/(?:total|subtotal|tax|tip|balance|amount due|payment|change|card|cash)/i.test(line)) {
      continue;
    }

    // Look for price patterns: $X.XX or X.XX at end of line
    const priceMatch = line.match(/\$?\s*(\d+\.\d{2})\s*$/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      // Get item name (everything before the price)
      const name = line.substring(0, line.lastIndexOf(priceMatch[0])).trim()
        .replace(/^\d+\s*x?\s*/i, '') // Remove quantity prefix if exists
        .replace(/[@#*-]/g, '') // Remove special chars
        .trim();

      if (name && name.length > 1 && price > 0 && price < 1000) {
        // Check for quantity prefix (e.g., "2x Burger" or "2 Burger")
        const qtyMatch = line.match(/^(\d+)\s*x?\s+/i);
        const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
        
        // Calculate unit price
        const unitPrice = quantity > 1 ? price / quantity : price;
        
        // Create separate items for each quantity
        for (let i = 0; i < quantity; i++) {
          itemCounter++;
          items.push({
            id: itemCounter.toString(),
            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
            price: unitPrice,
            quantity: 1
          });
        }
      }
    }
  }

  // Extract subtotal
  const subtotalMatch = text.match(/(?:subtotal|sub-total|sub total)[:\s]+\$?\s*([\d,]+\.?\d{0,2})/i);
  subtotal = subtotalMatch ? parseFloat(subtotalMatch[1].replace(',', '')) : 0;

  // Extract tax
  const taxMatch = text.match(/(?:tax|sales tax|hst|gst)[:\s]+\$?\s*([\d,]+\.?\d{0,2})/i);
  tax = taxMatch ? parseFloat(taxMatch[1].replace(',', '')) : 0;

  // Extract tip
  const tipMatch = text.match(/(?:tip|gratuity)[:\s]+\$?\s*([\d,]+\.?\d{0,2})/i);
  tip = tipMatch ? parseFloat(tipMatch[1].replace(',', '')) : 0;

  // Extract total
  const totalMatch = text.match(/(?:total|grand total|amount due|balance)[:\s]+\$?\s*([\d,]+\.?\d{0,2})/i);
  total = totalMatch ? parseFloat(totalMatch[1].replace(',', '')) : 0;

  // Calculate missing values if needed
  if (!subtotal && items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  if (!total && subtotal > 0) {
    total = subtotal + tax + tip;
  }

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    tip: parseFloat(tip.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
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