import { NextRequest, NextResponse } from "next/server";
import { parseReceiptText } from "@/lib/parseReceipt";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const receiptData = parseReceiptText(text);
    
    return NextResponse.json({
      success: true,
      data: receiptData
    });
  } catch (error) {
    console.error("Error parsing receipt text:", error);
    return NextResponse.json(
      { error: "Failed to parse receipt text", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

