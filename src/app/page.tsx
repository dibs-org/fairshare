import Link from "next/link";
import { Camera, Receipt, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div>
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 dark:bg-primary/20 rounded-full mb-6">
            <Receipt className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-6 tracking-tight">fairshare</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Snap a photo of any receipt, instantly itemize everything, and split
            the bill with friends via Venmo in seconds.
          </p>
          <Button asChild>
            <Link href="/receipt-scanner">
              <Camera />
              Scan receipt
            </Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Camera className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Snap & Scan</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Take a photo or upload an image of your receipt. We instantly read
              and process it.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Receipt className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Auto Itemize</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Every item, price, tax, and tip is automatically extracted and
              organized for you.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Users className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Split & Pay</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select items for each person and instantly open Venmo with the
              exact amount.
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Capture Receipt</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take a photo with your camera or upload from gallery
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Process Receipt</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All items and prices are extracted automatically
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Select Items</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose which items each person should pay for
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-semibold mb-2">Pay via Venmo</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Open Venmo with pre-filled amount and send payment
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
