"use client";

import { useState } from "react";
import { ReceiptData } from "@/lib/parseReceipt";

export default function TestParsePage() {
  const [text, setText] = useState(`Dine in 5212	
Nan Xiang Soup Dumplings (PA-King of	Prussia)	
160 N Gulph Rd suite 4220	
King of Prussia PA 19406	
484-684-6200	
Guests: 3	
Table: C3	Server: Fei	
11-14-25 8:30PM	$12.00	
1	Crab Meat & Pork	
Soup Dumplings (6)	
9*/#E2(**)	
$12.00	
1	Vegetable Soup	
Dumplings(6)	
$10.75	
1	Four Happiness	
Kaofu	
$12.95	
1	Vegetable Crispy	
Noodle	
1	Diet Pepsi	$2.95	
Items: 5	
Subtotal	$50.65	
Tax	$3.04	
Total	$53.69	
Unpaid	
Tip Suggestion	
18% (Tip: $9.66	Total: $63.35)	
20% (Tip: $10.74	Total: $64.43)	
22% (Tip: $11.81	Total. $85 501)`);
  const [result, setResult] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!text.trim()) {
      setError("Please enter some text to parse");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test-parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse text");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Test Receipt Parser
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="text-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                OCR Text Input
              </label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your OCR text here..."
                className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
              />
            </div>
            <button
              onClick={handleParse}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Parsing..." : "Parse Receipt"}
            </button>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Parsed Results
            </h2>
            {result ? (
              <div className="space-y-4">
                {/* Items */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                    Items ({result.items.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.items.length > 0 ? (
                      result.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {item.name}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-4">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Qty: {item.quantity}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No items found
                      </p>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                    Totals
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${result.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${result.tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tip:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${result.tip.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Total:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${result.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Raw JSON */}
                <details className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                    Raw JSON
                  </summary>
                  <pre className="mt-4 text-xs overflow-x-auto bg-gray-50 dark:bg-gray-900 p-4 rounded">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Enter OCR text and click "Parse Receipt" to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

