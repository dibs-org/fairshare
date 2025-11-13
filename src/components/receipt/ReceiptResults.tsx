"use client";

import { useState } from "react";
import { ReceiptData } from "@/app/receipt-scanner/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, DollarSign, Users, Share2, Check, Copy, Mail, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReceiptResultsProps = {
  receiptData: ReceiptData;
  onReset: () => void;
};

export default function ReceiptResults({ receiptData, onReset }: ReceiptResultsProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [personName, setPersonName] = useState("");
  const [venmoUsername, setVenmoUsername] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const calculateSelectedTotal = () => {
    const selectedItemsTotal = receiptData.items
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Proportionally calculate tax and tip
    const ratio = selectedItemsTotal / receiptData.subtotal;
    const proportionalTax = receiptData.tax * ratio;
    const proportionalTip = receiptData.tip * ratio;
    
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
      const webUrl = `https://venmo.com/?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}${venmoUsername ? `&recipients=${encodeURIComponent(venmoUsername)}` : ''}`;
      window.open(webUrl, '_blank');
    }, 1000);
  };

  const generateShareLink = (): string => {
    // Encode receiptData as base64 JSON
    const jsonString = JSON.stringify(receiptData);
    // Use unescape(encodeURIComponent()) to handle Unicode characters properly
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    // URL-encode the base64 string to handle special characters (+, /, =)
    const urlSafeBase64 = encodeURIComponent(base64);
    // Ensure we use the correct path
    const path = window.location.pathname || '/receipt-scanner';
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
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareLink = generateShareLink();
    const shareText = `Check out this receipt! Split the bill with me: ${shareLink}`;

    // Try native Web Share API first (works on mobile and some desktop browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Receipt to Split',
          text: shareText,
          url: shareLink,
        });
        return; // Successfully shared via native share
      } catch (err) {
        // User cancelled or share failed, fall through to dialog
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
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

  const handleShareViaEmail = () => {
    const shareLink = generateShareLink();
    const subject = encodeURIComponent('Receipt to Split');
    const body = encodeURIComponent(`Check out this receipt! Split the bill with me:\n\n${shareLink}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareViaMessage = () => {
    const shareLink = generateShareLink();
    const text = encodeURIComponent(`Check out this receipt! Split the bill with me: ${shareLink}`);
    window.location.href = `sms:?body=${text}`;
  };

  const selectedTotal = calculateSelectedTotal();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Receipt Items</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select items to split the bill
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Receipt
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Scan New Receipt
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Items</h3>
            <div className="space-y-3">
              {receiptData.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${receiptData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>${receiptData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tip</span>
                <span>${receiptData.tip.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${receiptData.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <div className="text-center mb-6">
              <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="text-xl font-semibold mb-1">Your Share</h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                ${selectedTotal.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="personName">Your Name <Label className="text-xs text-gray-500">Optional</Label></Label>
                <Input
                  id="personName"
                  placeholder="Enter your name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="venmoUsername">Venmo Username <Label className="text-xs text-gray-500">Required</Label></Label>
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

              <Button
                className="w-full"
                size="lg"
                onClick={handleVenmoPayment}
                disabled={selectedItems.size === 0 || venmoUsername === ""}
              >
                <Users className="w-4 h-4 mr-2" />
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
              Share this receipt link with others so they can split the bill with you.
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
                {linkCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {linkCopied && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
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
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShareViaMessage}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
