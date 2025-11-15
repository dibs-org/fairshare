"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import ReceiptUpload from "@/components/receipt/ReceiptUpload";
import ReceiptResults from "@/components/receipt/ReceiptResults";

export type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type ReceiptData = {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  error?: string;
};

export default function ReceiptScannerPage() {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load receipt data from share link if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get("share");

    if (shareData) {
      try {
        console.log("Loading from share link, data length:", shareData.length);
        // URLSearchParams.get() already URL-decodes the base64 string
        // Now decode the base64 and handle Unicode properly
        const base64Decoded = atob(shareData);
        const jsonString = decodeURIComponent(escape(base64Decoded));
        console.log(
          "Decoded JSON string:",
          jsonString.substring(0, 100) + "..."
        );
        const decodedData: ReceiptData = JSON.parse(jsonString);

        // Validate the decoded data
        if (!decodedData.items || !Array.isArray(decodedData.items)) {
          throw new Error("Invalid receipt data structure");
        }

        console.log("Successfully loaded receipt data:", decodedData);
        setReceiptData(decodedData);
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname);
      } catch (err) {
        console.error("Failed to decode share link:", err);
        console.error("Share data:", shareData.substring(0, 50) + "...");
        setError("Invalid share link. Please try scanning a new receipt.");
      }
    }
  }, []);

  const resizeImage = async (
    file: File,
    maxSizeKB: number = 1024
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Calculate new dimensions (max 1920px on longest side to maintain quality)
          const maxDimension = 1920;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Try different quality levels until we're under the size limit
          const tryCompress = (quality: number): void => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to compress image"));
                  return;
                }

                const sizeKB = blob.size / 1024;

                if (sizeKB <= maxSizeKB || quality <= 0.1) {
                  // Create a new File from the blob
                  const resizedFile = new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  resolve(resizedFile);
                } else {
                  // Reduce quality and try again
                  tryCompress(quality - 0.1);
                }
              },
              "image/jpeg",
              quality
            );
          };

          // Start with 0.9 quality
          tryCompress(0.9);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  const handleImageCapture = async (imageFile: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log("Image captured, file size:", imageFile.size, "bytes");

      // Resize image to be under 1024 KB
      const resizedFile = await resizeImage(imageFile, 1024);
      console.log("Image resized, new size:", resizedFile.size, "bytes");

      // Convert resized image to base64
      const base64 = await fileToBase64(resizedFile);
      console.log("Image converted to base64, length:", base64.length);

      // Send to API for processing
      const response = await fetch("/api/process-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      });

      console.log("API response status:", response.status);

      const data = await response.json();
      console.log("API response data:", data);

      if (!response.ok) {
        // Extract error message from API response
        const errorMessage = data.error || "Failed to process receipt";
        console.error("API error:", errorMessage);
        throw new Error(errorMessage);
      }

      console.log("Receipt data received:", data);
      setReceiptData(data);
      if (!subtotalEqualsItemsTotal(data)) {
        console.error("Subtotal does not equal items total. Please check your receipt.");
      }
    } catch (err) {
      console.error("Error processing receipt:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process receipt"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotalEqualsItemsTotal = (receiptData: ReceiptData) => {
    let total = receiptData.items.reduce((sum, item) => {
      return sum + item.price;
    }, 0);
    total = total + receiptData.tax + receiptData.tip;
    console.log('total:', total);
    console.log('subtotal:', receiptData.subtotal);
    return receiptData.subtotal === total;
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleReset = () => {
    setReceiptData(null);
    setError(null);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft />
              Back to Home
            </Link>
          </Button>
        </div>

        {!receiptData && !isProcessing && (
          <ReceiptUpload onImageCapture={handleImageCapture} error={error} />
        )}

        {isProcessing && (
          <Card className="p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Processing Receipt...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our processor is extracting items and prices from your receipt
            </p>
          </Card>
        )}

        {receiptData && !isProcessing && (
          <ReceiptResults receiptData={receiptData} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
