"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ReceiptData } from "@/app/receipt-scanner/page";

type ReceiptPreviewCardProps = {
  receiptData: ReceiptData;
  shareLink: string;
};

export default function ReceiptPreviewCard({
  receiptData,
  shareLink,
}: ReceiptPreviewCardProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const topItems = receiptData.items.slice(0, 5);
  const remainingCount = Math.max(0, receiptData.items.length - 5);

  useEffect(() => {
    // Generate QR code as data URL
    QRCode.toDataURL(shareLink, {
      width: 120,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((url: string) => {
        setQrCodeDataUrl(url);
      })
      .catch((err: Error) => {
        console.error("Failed to generate QR code:", err);
      });
  }, [shareLink]);

  return (
    <div
      id="receipt-preview"
      style={{
        width: "600px",
        margin: "0 auto",
        padding: "32px",
        background:
          "linear-gradient(to bottom right, #eff6ff, #ffffff, #faf5ff)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          padding: "24px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "2px solid #bfdbfe",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(to bottom right, #3b82f6, #a855f7)",
              marginBottom: "12px",
            }}
          >
            <svg
              style={{ width: "32px", height: "32px", color: "#ffffff" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "4px",
            }}
          >
            fairshare
          </h1>
          <p style={{ fontSize: "14px", color: "#4b5563" }}>
            because friends don't let friends do math
          </p>
        </div>

        {/* Items List */}
        <div style={{ marginBottom: "16px" }}>
          {topItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: index > 0 ? "8px" : "0",
                paddingBottom: "8px",
                borderBottom:
                  index < topItems.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: "500", color: "#1f2937" }}>
                  {item.name}
                </p>
                {item.quantity > 1 && (
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    Qty: {item.quantity}
                  </p>
                )}
              </div>
              <span style={{ fontWeight: "600", color: "#1f2937" }}>
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          {remainingCount > 0 && (
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                textAlign: "center",
                paddingTop: "8px",
              }}
            >
              + {remainingCount} more item{remainingCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Totals */}
        <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              color: "#4b5563",
              marginBottom: "8px",
            }}
          >
            <span>Subtotal</span>
            <span>${receiptData.subtotal.toFixed(2)}</span>
          </div>
          {receiptData.tax > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                color: "#4b5563",
                marginBottom: "8px",
              }}
            >
              <span>Tax</span>
              <span>${receiptData.tax.toFixed(2)}</span>
            </div>
          )}
          {receiptData.tip > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                color: "#4b5563",
                marginBottom: "8px",
              }}
            >
              <span>Tip</span>
              <span>${receiptData.tip.toFixed(2)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1f2937",
              paddingTop: "8px",
              borderTop: "1px solid #e5e7eb",
              marginTop: "8px",
            }}
          >
            <span>Total</span>
            <span>${receiptData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* CTA with QR Code */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "2px dashed #d1d5db",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                style={{
                  display: "block",
                  margin: "0 auto",
                  padding: "8px",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  width: "120px",
                  height: "120px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  margin: "0 auto",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  fontSize: "12px",
                }}
              >
                Loading QR...
              </div>
            )}
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "#1f2937",
              fontWeight: "500",
              marginBottom: "4px",
            }}
          >
            Scan to split this receipt
          </p>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>receiptsplit.app</p>
        </div>
      </div>
    </div>
  );
}
