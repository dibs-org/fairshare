"use client";

import { useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ReceiptUploadProps = {
  onImageCapture: (file: File) => void;
  error: string | null;
};

export default function ReceiptUpload({ onImageCapture, error }: ReceiptUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageCapture(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Scan Your Receipt</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Take a photo or upload an image to get started
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed"
          onClick={() => cameraInputRef.current?.click()}>
          <Camera className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Take Photo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Use your camera to capture the receipt
          </p>
          <Button className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Open Camera
          </Button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
        </Card>

        <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed"
          onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose a photo from your device
          </p>
          <Button className="w-full" variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </Card>
      </div>

      <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Tips for best results:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li>Ensure the receipt is well-lit and in focus</li>
          <li>Capture the entire receipt including all items</li>
          <li>Avoid shadows and glare on the receipt</li>
          <li>Make sure text is clearly readable</li>
        </ul>
      </Card>
    </div>
  );
}
