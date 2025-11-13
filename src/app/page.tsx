import Link from "next/link";
import { Camera, Receipt, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            fairshare
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Snap a photo of any receipt, instantly itemize everything, and split the bill with friends via Venmo in seconds.
          </p>
          <Link href="/receipt-scanner">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
              <Camera className="w-5 h-5 mr-2" />
              scan receipt now
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Snap & Scan</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Take a photo or upload an image of your receipt. We instantly read and process it.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
              <Receipt className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Auto Itemize</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Every item, price, tax, and tip is automatically extracted and organized for you.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Split & Pay</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select items for each person and instantly open Venmo with the exact amount.
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Capture Receipt</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take a photo with your camera or upload from gallery
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Process Receipt</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All items and prices are extracted automatically
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Select Items</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose which items each person should pay for
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
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