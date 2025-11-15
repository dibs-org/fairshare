"use client";

import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { ReceiptData, ReceiptItem } from "@/app/receipt-scanner/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RotateCcw,
  DollarSign,
  Users,
  Share2,
  Check,
  Copy,
  Mail,
  MessageSquare,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReceiptPreviewCard from "./ReceiptPreviewCard";

type ReceiptResultsProps = {
  receiptData: ReceiptData;
  onReset: () => void;
};

export default function ReceiptResults({
  receiptData,
  onReset,
}: ReceiptResultsProps) {
  const [editableReceiptData, setEditableReceiptData] =
    useState<ReceiptData>(receiptData);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [personName, setPersonName] = useState("");
  const [venmoUsername, setVenmoUsername] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    field: "name" | "price";
  } | null>(null);
  const [editingField, setEditingField] = useState<"tax" | "tip" | null>(null);

  // Update editable receipt data when prop changes
  useEffect(() => {
    console.log("ReceiptResults: receiptData changed", receiptData);
    setEditableReceiptData(receiptData);
  }, [receiptData]);

  // Debug: Log when editing state changes
  useEffect(() => {
    console.log("ReceiptResults: editingItem changed", editingItem);
  }, [editingItem]);

  // Debug: Log editable receipt data
  useEffect(() => {
    console.log("ReceiptResults: editableReceiptData", editableReceiptData);
  }, [editableReceiptData]);

  // Check if we're on iOS/Mac (where Apple Pay Cash in Messages is available)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent.toLowerCase();
      const platform = navigator.platform.toLowerCase();

      // Check if we're on iOS
      const isIOS =
        /ipad|iphone|ipod/.test(userAgent) ||
        (platform === "macintel" && navigator.maxTouchPoints > 1);

      // Check if we're on macOS
      const isMac =
        /macintosh|mac intel|macppc|mac68k/.test(userAgent) ||
        platform.includes("mac");

      // Check if we're on Safari
      // Safari's user agent contains "safari" but not "chrome" or "firefox"
      const isSafari =
        /safari/.test(userAgent) &&
        !/chrome|firefox|edge|opera/.test(userAgent) &&
        !/crios|fxios/.test(userAgent);

      // Also check vendor for Safari
      const isSafariVendor =
        !!navigator.vendor && navigator.vendor.includes("Apple");

      // Apple Pay Cash in Messages is available on iOS and macOS Safari
      // Show it on iOS or macOS Safari (be more permissive)
      const shouldShow = isIOS || (isMac && (isSafari || isSafariVendor));

      setIsApplePayAvailable(shouldShow);
    }
  }, []);

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Recalculate totals when items change
  const recalculateTotals = (items: ReceiptItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    // Keep tax and tip as percentages of subtotal if possible, otherwise keep original
    const taxRatio =
      editableReceiptData.subtotal > 0
        ? editableReceiptData.tax / editableReceiptData.subtotal
        : 0;
    const tipRatio =
      editableReceiptData.subtotal > 0
        ? editableReceiptData.tip / editableReceiptData.subtotal
        : 0;
    const tax = subtotal * taxRatio;
    const tip = subtotal * tipRatio;
    const total = subtotal + tax + tip;

    return { subtotal, tax, tip, total };
  };

  const updateItemName = (itemId: string, newName: string) => {
    const updatedItems = editableReceiptData.items.map((item) =>
      item.id === itemId ? { ...item, name: newName } : item
    );
    const totals = recalculateTotals(updatedItems);
    setEditableReceiptData({
      ...editableReceiptData,
      items: updatedItems,
      ...totals,
      error: editableReceiptData.error, // Preserve error field
    });
    setEditingItem(null);
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    const updatedItems = editableReceiptData.items.map((item) =>
      item.id === itemId ? { ...item, price: newPrice } : item
    );
    const totals = recalculateTotals(updatedItems);
    setEditableReceiptData({
      ...editableReceiptData,
      items: updatedItems,
      ...totals,
      error: editableReceiptData.error, // Preserve error field
    });
    setEditingItem(null);
  };

  const deleteItem = (itemId: string) => {
    // Remove from selected items if it was selected
    const newSelected = new Set(selectedItems);
    newSelected.delete(itemId);
    setSelectedItems(newSelected);

    // Remove item from list
    const updatedItems = editableReceiptData.items.filter(
      (item) => item.id !== itemId
    );
    const totals = recalculateTotals(updatedItems);
    setEditableReceiptData({
      ...editableReceiptData,
      items: updatedItems,
      ...totals,
      error: editableReceiptData.error, // Preserve error field
    });
  };

  const updateTax = (newTax: number) => {
    if (isNaN(newTax) || newTax < 0) return;
    const total =
      editableReceiptData.subtotal + newTax + editableReceiptData.tip;
    setEditableReceiptData({ ...editableReceiptData, tax: newTax, total, error: editableReceiptData.error });
    setEditingField(null);
  };

  const updateTip = (newTip: number) => {
    if (isNaN(newTip) || newTip < 0) return;
    const total =
      editableReceiptData.subtotal + editableReceiptData.tax + newTip;
    setEditableReceiptData({ ...editableReceiptData, tip: newTip, total, error: editableReceiptData.error });
    setEditingField(null);
  };

  const calculateSelectedTotal = () => {
    const selectedItemsTotal = editableReceiptData.items
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Proportionally calculate tax and tip
    const ratio =
      editableReceiptData.subtotal > 0
        ? selectedItemsTotal / editableReceiptData.subtotal
        : 0;
    const proportionalTax = editableReceiptData.tax * ratio;
    const proportionalTip = editableReceiptData.tip * ratio;

    return selectedItemsTotal + proportionalTax + proportionalTip;
  };

  const handleVenmoPayment = () => {
    const amount = calculateSelectedTotal().toFixed(2);
    const note = `Payment for ${selectedItems.size} item(s) from receipt`;

    // Create Venmo deep link
    let venmoUrl = `venmo://paycharge?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}`;

    if (venmoUsername) {
      venmoUrl += `&recipients=${encodeURIComponent(venmoUsername)}`;
    }

    // Try to open Venmo app, fallback to web
    window.location.href = venmoUrl;

    // Fallback to web version after a delay
    setTimeout(() => {
      const webUrl = `https://venmo.com/?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}${venmoUsername ? `&recipients=${encodeURIComponent(venmoUsername)}` : ""}`;
      window.open(webUrl, "_blank");
    }, 1000);
  };

  const handleApplePay = () => {
    const amount = calculateSelectedTotal().toFixed(2);
    const selectedItemsList = editableReceiptData.items
      .filter((item) => selectedItems.has(item.id))
      .map(
        (item) =>
          `${item.name}${item.quantity > 1 ? ` (${item.quantity}x)` : ""}`
      )
      .join(", ");

    // Create message text for Apple Pay Cash
    const message = `I owe you $${amount} for: ${selectedItemsList}`;

    // Try to open Messages app with payment request
    // On iOS, this will open Messages where user can use Apple Pay Cash
    const messagesUrl = `sms:&body=${encodeURIComponent(message)}`;

    // Try to open Messages app
    window.location.href = messagesUrl;

    // Fallback: Copy message to clipboard and show instructions
    setTimeout(() => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(message).then(() => {
          alert(
            `Message copied! Open Messages and paste to send payment request via Apple Pay Cash.`
          );
        });
      } else {
        alert(
          `Open Messages and send: "${message}" to request payment via Apple Pay Cash.`
        );
      }
    }, 500);
  };

  const generateShareLink = (): string => {
    // Encode receiptData as base64 JSON
    const jsonString = JSON.stringify(editableReceiptData);
    // Use unescape(encodeURIComponent()) to handle Unicode characters properly
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    // URL-encode the base64 string to handle special characters (+, /, =)
    const urlSafeBase64 = encodeURIComponent(base64);
    // Ensure we use the correct path
    const path = window.location.pathname || "/receipt-scanner";
    const shareUrl = `${window.location.origin}${path}?share=${urlSafeBase64}`;
    return shareUrl;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareLink = generateShareLink();
    // Format with URL on new line so Messages auto-detects it as clickable link
    const shareText = `Check out this receipt! Split the bill with me\n\n${shareLink}`;

    // Try native Web Share API first (works on mobile and some desktop browsers)
    if (navigator.share) {
      try {
        // Generate the preview image
        const imageBlob = await generateReceiptImage();

        const shareData: ShareData = {
          title: "Receipt to Split",
          text: shareText, // URL in text on new line will be auto-detected
        };

        // Add image if available and supported
        if (
          imageBlob &&
          navigator.canShare &&
          navigator.canShare({
            files: [
              new File([imageBlob], "receipt.png", { type: "image/png" }),
            ],
          })
        ) {
          shareData.files = [
            new File([imageBlob], "receipt-preview.png", { type: "image/png" }),
          ];
        }

        await navigator.share(shareData);
        return; // Successfully shared via native share
      } catch (err) {
        // User cancelled or share failed, fall through to dialog
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    // Fallback: Show dialog with link
    setShowShareDialog(true);
  };

  const handleCopyLink = () => {
    const shareLink = generateShareLink();
    copyToClipboard(shareLink);
  };

  const generateReceiptImage = async (): Promise<Blob | null> => {
    try {
      // Create an iframe to completely isolate styles
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      iframe.style.width = "700px";
      iframe.style.height = "800px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      // Wait for iframe to load
      await new Promise((resolve) => {
        iframe.onload = resolve;
        iframe.src = "about:blank";
      });

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        return null;
      }

      // Write basic HTML structure with no external styles
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: system-ui, -apple-system, sans-serif; }
            </style>
          </head>
          <body></body>
        </html>
      `);
      iframeDoc.close();

      // Create container in iframe
      const container = iframeDoc.body;
      container.style.width = "600px";
      container.style.margin = "0 auto";
      container.style.padding = "32px";
      container.style.background = "#f0f4f8";

      // Render the preview card in iframe
      const shareLink = generateShareLink();
      const root = createRoot(container);
      root.render(
        <ReceiptPreviewCard
          receiptData={editableReceiptData}
          shareLink={shareLink}
        />
      );

      // Wait for render and QR code to load
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Wait for QR code image to load
      const checkQRCode = () => {
        return new Promise<void>((resolve) => {
          const qrImg = container.querySelector(
            '#receipt-preview img[alt="QR Code"]'
          ) as HTMLImageElement;
          if (qrImg && qrImg.complete && qrImg.naturalWidth > 0) {
            resolve();
          } else {
            // Check again after a delay
            setTimeout(() => {
              const retryImg = container.querySelector(
                '#receipt-preview img[alt="QR Code"]'
              ) as HTMLImageElement;
              if (retryImg && retryImg.complete && retryImg.naturalWidth > 0) {
                resolve();
              } else {
                // Resolve anyway after max wait
                setTimeout(resolve, 1000);
              }
            }, 500);
          }
        });
      };
      await checkQRCode();

      // Find the preview element
      const previewElement = container.querySelector(
        "#receipt-preview"
      ) as HTMLElement;
      if (!previewElement) {
        root.unmount();
        document.body.removeChild(iframe);
        return null;
      }

      // Generate image using html2canvas
      const canvas = await html2canvas(previewElement, {
        backgroundColor: "#f0f4f8",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        windowWidth: 700,
        windowHeight: 800,
      } as any);

      // Clean up
      root.unmount();
      document.body.removeChild(iframe);

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/png",
          0.95
        );
      });
    } catch (error) {
      console.error("Failed to generate image:", error);
      return null;
    }
  };

  const handleShareViaEmail = async () => {
    const shareLink = generateShareLink();
    const subject = encodeURIComponent("Receipt to Split");
    const body = encodeURIComponent(
      `Check out this receipt! Split the bill with me:\n\n${shareLink}`
    );

    // Try to generate and attach image if possible
    const imageBlob = await generateReceiptImage();

    if (imageBlob && navigator.share) {
      try {
        const imageFile = new File([imageBlob], "receipt-preview.png", {
          type: "image/png",
        });
        // Include URL in text on new line for better email client support
        await navigator.share({
          title: "Receipt to Split",
          text: `Check out this receipt! Split the bill with me\n\n${shareLink}`,
          files: [imageFile],
        });
        return;
      } catch (err) {
        console.error("Share with image failed:", err);
      }
    }

    // Fallback to mailto
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareViaMessage = async () => {
    const shareLink = generateShareLink();
    // Format message so URL appears on its own line - Messages will auto-detect and make it clickable
    const text = `Check out this receipt! Split the bill with me\n\n${shareLink}`;

    // Generate the preview image
    const imageBlob = await generateReceiptImage();

    if (imageBlob && navigator.share) {
      try {
        // Create a File from the blob
        const imageFile = new File([imageBlob], "receipt-preview.png", {
          type: "image/png",
        });

        // For Messages, include URL in text on separate line so it's auto-detected as clickable
        await navigator.share({
          title: "Receipt to Split",
          text: text, // URL in text on new line will be auto-detected as clickable link
          files: [imageFile],
        });
        return;
      } catch (err) {
        console.error("Share with image failed:", err);
      }
    }

    // Fallback to SMS link - URL on new line will be auto-detected
    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  };

  const selectedTotal = calculateSelectedTotal();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">receipt items</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select items to split the bill
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare} className="md:px-4">
            <Share2 className="w-4 h-4" />
            <span className="hidden md:inline ml-2">Share Receipt</span>
          </Button>
          <Button variant="outline" onClick={onReset} className="md:px-4">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline ml-2">Scan New Receipt</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-semibold">Items</h3>
              {editableReceiptData?.error === "subtotal_mismatch" && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" title="Subtotal doesn't match calculated total">
                  <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Subtotal mismatch</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {editableReceiptData?.items?.length > 0 ? (
                editableReceiptData.items.map((item) => {
                  const isEditingName =
                    editingItem?.id === item.id &&
                    editingItem?.field === "name";
                  const isEditingPrice =
                    editingItem?.id === item.id &&
                    editingItem?.field === "price";

                  return (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <div className="flex-1 flex items-center gap-2">
                          {isEditingName ? (
                            <Input
                              defaultValue={item.name}
                              onBlur={(e) => {
                                const newName = e.target.value.trim();
                                if (newName && newName !== item.name) {
                                  updateItemName(item.id, newName);
                                } else {
                                  setEditingItem(null);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const newName = e.currentTarget.value.trim();
                                  if (newName && newName !== item.name) {
                                    updateItemName(item.id, newName);
                                  } else {
                                    setEditingItem(null);
                                  }
                                } else if (e.key === "Escape") {
                                  setEditingItem(null);
                                }
                              }}
                              autoFocus
                              className="h-8 text-sm flex-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div className="flex-1">
                              <p
                                className="font-medium cursor-pointer hover:text-primary inline-block"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log(
                                    "Clicking to edit name for item:",
                                    item.id
                                  );
                                  setEditingItem({
                                    id: item.id,
                                    field: "name",
                                  });
                                }}
                                title="Click to edit"
                              >
                                {item.name}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Qty: {item.quantity} × $
                                  {item.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                          )}
                          {!isEditingName && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(
                                  "Clicking pencil to edit name for item:",
                                  item.id
                                );
                                setEditingItem({ id: item.id, field: "name" });
                              }}
                              className="opacity-60 hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                              title="Edit item name"
                              type="button"
                            >
                              <Pencil className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditingPrice ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={item.price.toFixed(2)}
                            onBlur={(e) => {
                              const newPrice = parseFloat(e.target.value);
                              if (
                                !isNaN(newPrice) &&
                                newPrice >= 0 &&
                                newPrice !== item.price
                              ) {
                                updateItemPrice(item.id, newPrice);
                              } else {
                                setEditingItem(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const newPrice = parseFloat(
                                  e.currentTarget.value
                                );
                                if (
                                  !isNaN(newPrice) &&
                                  newPrice >= 0 &&
                                  newPrice !== item.price
                                ) {
                                  updateItemPrice(item.id, newPrice);
                                } else {
                                  setEditingItem(null);
                                }
                              } else if (e.key === "Escape") {
                                setEditingItem(null);
                              }
                            }}
                            autoFocus
                            className="h-8 w-24 text-sm text-right"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <>
                            <span
                              className="font-semibold cursor-pointer hover:text-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(
                                  "Clicking to edit price for item:",
                                  item.id
                                );
                                setEditingItem({ id: item.id, field: "price" });
                              }}
                              title="Click to edit price"
                            >
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(
                                  "Clicking pencil to edit price for item:",
                                  item.id
                                );
                                setEditingItem({ id: item.id, field: "price" });
                              }}
                              className="opacity-60 hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity ml-1"
                              title="Edit price"
                              type="button"
                            >
                              <Pencil className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (confirm(`Delete "${item.name}"?`)) {
                                  deleteItem(item.id);
                                }
                              }}
                              className="opacity-60 hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity ml-1"
                              title="Delete item"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No items found</p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${editableReceiptData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 group">
                <span>Tax</span>
                <div className="flex items-center gap-2">
                  {editingField === "tax" ? (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={editableReceiptData.tax.toFixed(2)}
                      onBlur={(e) => {
                        const newTax = parseFloat(e.target.value);
                        if (
                          !isNaN(newTax) &&
                          newTax >= 0 &&
                          newTax !== editableReceiptData.tax
                        ) {
                          updateTax(newTax);
                        } else {
                          setEditingField(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const newTax = parseFloat(e.currentTarget.value);
                          if (
                            !isNaN(newTax) &&
                            newTax >= 0 &&
                            newTax !== editableReceiptData.tax
                          ) {
                            updateTax(newTax);
                          } else {
                            setEditingField(null);
                          }
                        } else if (e.key === "Escape") {
                          setEditingField(null);
                        }
                      }}
                      autoFocus
                      className="h-8 w-24 text-sm text-right"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span
                        className="cursor-pointer hover:text-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingField("tax");
                        }}
                        title="Click to edit tax"
                      >
                        ${editableReceiptData.tax.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingField("tax");
                        }}
                        className="opacity-60 hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                        title="Edit tax"
                        type="button"
                      >
                        <Pencil className="w-3 h-3 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 group">
                <span>Tip</span>
                <div className="flex items-center gap-2">
                  {editingField === "tip" ? (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={editableReceiptData.tip.toFixed(2)}
                      onBlur={(e) => {
                        const newTip = parseFloat(e.target.value);
                        if (
                          !isNaN(newTip) &&
                          newTip >= 0 &&
                          newTip !== editableReceiptData.tip
                        ) {
                          updateTip(newTip);
                        } else {
                          setEditingField(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const newTip = parseFloat(e.currentTarget.value);
                          if (
                            !isNaN(newTip) &&
                            newTip >= 0 &&
                            newTip !== editableReceiptData.tip
                          ) {
                            updateTip(newTip);
                          } else {
                            setEditingField(null);
                          }
                        } else if (e.key === "Escape") {
                          setEditingField(null);
                        }
                      }}
                      autoFocus
                      className="h-8 w-24 text-sm text-right"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span
                        className="cursor-pointer hover:text-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingField("tip");
                        }}
                        title="Click to edit tip"
                      >
                        ${editableReceiptData.tip.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingField("tip");
                        }}
                        className="opacity-60 hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                        title="Edit tip"
                        type="button"
                      >
                        <Pencil className="w-3 h-3 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${editableReceiptData.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="space-y-4">
          <Card className="p-6 bg-muted/50">
            <div className="text-center mb-6">
              <DollarSign className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-semibold mb-1">Your Share</h3>
              <p className="text-4xl font-bold text-primary">
                ${selectedTotal.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}{" "}
                selected
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="personName">
                  Your Name{" "}
                  <Label className="text-xs text-gray-500">Optional</Label>
                </Label>
                <Input
                  id="personName"
                  placeholder="Enter your name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="venmoUsername">
                  Venmo Username{" "}
                  <Label className="text-xs text-gray-500">Required</Label>
                </Label>
                <Input
                  id="venmoUsername"
                  placeholder="@username"
                  value={venmoUsername}
                  onChange={(e) => setVenmoUsername(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the person to pay
                </p>
              </div>

              {isApplePayAvailable && (
                <Button
                  onClick={handleApplePay}
                  disabled={selectedItems.size === 0}
                >
                  <MessageSquare />
                  Request via Apple Pay Cash
                </Button>
              )}

              <Button
                className="w-full"
                onClick={handleVenmoPayment}
                disabled={selectedItems.size === 0 || venmoUsername === ""}
              >
                <Users />
                Open Venmo to Pay
              </Button>

              {selectedItems.size === 0 && (
                <p className="text-xs text-center text-gray-500">
                  Select at least one item to continue
                </p>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100 text-sm">
              How it works:
            </h4>
            <ul className="text-xs text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
              <li>Select your items from the receipt</li>
              <li>Tax and tip are split proportionally</li>
              <li>Click to open Venmo with amount pre-filled</li>
              <li>Complete payment in Venmo app</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Receipt</DialogTitle>
            <DialogDescription>
              Share this receipt link with others so they can split the bill
              with you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={generateShareLink()}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                title="Copy link"
              >
                {linkCopied ? <Check /> : <Copy />}
              </Button>
            </div>
            {linkCopied && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" />
                Link copied to clipboard!
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShareViaEmail}
              >
                <Mail />
                Email
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShareViaMessage}
              >
                <MessageSquare />
                Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
