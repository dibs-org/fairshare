import Link from "next/link";
import { Camera, Receipt, Users, RollerCoaster, Scan, Bot, Wallet, TrendingUp, Sparkles, HandCoins, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div>
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 dark:bg-primary/20 rounded-full mb-6">
            <RollerCoaster className="w-8 h-8 text-primary" />
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

      <div  className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
      {/* Header with stars */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-3xl"> <Sparkles className="w-8 h-8 text-black-600 dark:text-orange-400" /></span>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            be the hero of every group dinner
          </h4>
          <span className="text-3xl"> <Star className="w-8 h-8 text-black-600 dark:text-orange-400" /></span>
        </div>
      </div>
      {/* Feature Grid */}
      <div className="grid md:grid-cols-4 gap-8">
        {/* Feature 1 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-pink-900/30 mb-4">
            <Receipt className="w-8 h-8 text-black-600 dark:text-pink-400" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
            drop the receipt
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          take a photo or upload from your phone (idc what u use)
          </p>
        </div>
              {/* Feature 2 */}
              <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-orange-900/30 mb-4">
            <Bot className="w-8 h-8 text-black-600 dark:text-orange-400" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
            watch it work
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
           our robot reads it for you (trust me)
          </p>
        </div>

        {/* Feature 3 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-purple-900/30 mb-4">
            <Users className="w-8 h-8 text-black-600 dark:text-purple-400" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
            split & vibe (tag who ate what)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            verify the receipt and share the link
          </p>
        </div>

        {/* Feature 4 */}
        <div className="text-center">
          <div className="inline-flex items-center 
            justify-center w-16 h-16 rounded-full 
            bg-gray-100 dark:bg-green-900/30 mb-4">
            <HandCoins className="w-8 h-8 text-dark-green-600 dark:text-pink-400" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
           pay up divas
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            venmo requests sent
          </p>
        </div>
        </div>
        </div>
        

      
      </main>
    </div>
  );
}
