export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptData {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  error?: string;
}

export function parseReceiptText(text: string): ReceiptData {
  const lines = text.split('\n').filter(line => line.trim());
  const items: ReceiptItem[] = [];
  let subtotal = 0;
  let tax = 0;
  let tip = 0;
  let total = 0;

  // Extract items with prices - process in groups/columns
  let itemCounter = 0;
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Skip date/time lines (e.g., "11-14-25 8:30PM	$12.00")
    if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/.test(line.trim())) {
      i++;
      continue;
    }
    
    // Skip header/footer lines
    if (/(?:bill no|persons|no\.?\s*item|qty|price|amount|items:\s*\d+)/i.test(line)) {
      i++;
      continue;
    }
    
    // Skip table/header lines like "TABLE	10"
    if (/^[A-Z]+\s*\t\s*\d+\.?\s*$/i.test(line.trim())) {
      i++;
      continue;
    }
    
    // Skip total/tax/tip/subtotal lines
    if (/(?:total|subtotal|tax|tip|balance|amount due|payment|change|card|cash)/i.test(line) ) {
   //   && !/^[^\d]*\d+\.\d{2}/.test(line)) {
      i++;
      continue;
    }

    // Check for item line with quantity prefix and tab: "1	Crab Meat & Pork" or "1	Diet Pepsi	$2.95"
    const itemWithQtyMatch = line.match(/^(\d+)\t([^\t]+?)(?:\t(\$?\s*(\d+\.\d{2})))?\s*$/);
    if (itemWithQtyMatch && !line.match(/^\d+[xX]\s/)) {
      const [, qty, itemNamePart, , priceStr] = itemWithQtyMatch;
      const quantity = parseInt(qty);
      let itemName = itemNamePart.trim().replace(/[@#*]/g, '').trim();
      const descriptions: string[] = [];
      
      // Collect description lines until we hit a price or new item
      let j = i + 1;
      let foundPrice: number | null = null;
      
      while (j < lines.length) {
        const nextLine = lines[j];
        
        // Check if this is a price line
        const priceMatch = nextLine.match(/^\$?\s*(\d+\.\d{2})\s*[A-Za-z]?\s*$/);
        if (priceMatch) {
          foundPrice = parseFloat(priceMatch[1]);
          j++;
          break;
        }
        
        // Check if this is a new item (starts with number + tab)
        if (/^\d+\t/.test(nextLine)) {
          break;
        }
        
        // Check if this is a header/footer line
        if (/(?:items:\s*\d+|total|subtotal|tax|tip)/i.test(nextLine)) {
          break;
        }
        
        // This is a description line
        const trimmedDesc = nextLine.trim();
        // Skip lines that are just special chars/numbers
        if (trimmedDesc && 
            !/^[0-9\*\#\/\(\)]+$/.test(trimmedDesc) && 
            /[a-zA-Z]/.test(trimmedDesc) &&
            trimmedDesc.length > 1) {
          descriptions.push(trimmedDesc);
        }
        
        j++;
      }
      
      // Use price from same line, or from a following line, or 0 if not found
      const price = priceStr ? parseFloat(priceStr) : (foundPrice || 0);
      
      // Combine item name with descriptions
      if (descriptions.length > 0) {
        itemName = `${itemName} ${descriptions.join(' ')}`.trim();
      }
      
      // Create items
      if (itemName && itemName.length > 1) {
        const unitPrice = price > 0 && price < 1000 ? price / quantity : 0;
        for (let k = 0; k < quantity; k++) {
          itemCounter++;
          items.push({
            id: itemCounter.toString(),
            name: itemName.toLowerCase(),
            price: unitPrice,
            quantity: 1
          });
        }
      }
      
      i = j; // Move to the line after the price (or next item)
      continue;
    }
    
    // Check for standard format: item name with price on same line
    const priceMatch = line.match(/\$?\s*(\d+\.\d{2})\s*[A-Za-z]?\s*$/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      const pricePattern = priceMatch[0].replace(/[A-Za-z\s]*$/, '');
      const priceIndex = line.lastIndexOf(pricePattern);
      let name = line.substring(0, priceIndex).trim()
        .replace(/^\d+\s*x?\s*/i, '')
        .replace(/[@#*-]/g, '')
        .replace(/\d+%/, '')
        .trim();

      if (name && name.length > 1 && price > 0 && price < 1000) {
        const qtyMatch = line.match(/^(\d+)\s*x?\s+/i);
        const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
        const unitPrice = quantity > 1 ? price / quantity : price;
        
        for (let k = 0; k < quantity; k++) {
          itemCounter++;
          items.push({
            id: itemCounter.toString(),
            name: name.toLowerCase(),
            price: unitPrice,
            quantity: 1
          });
        }
      }
    }
    
    i++;
  }

  // Extract subtotal
  const subtotalMatch = text.match(/(?:subtotal|sub-total|sub total)[:\s]+\$?\s*([\d,]+\.?\d{0,2})/i);
  subtotal = subtotalMatch ? parseFloat(subtotalMatch[1].replace(',', '')) : 0;

  // Extract tax
  const taxMatch = text.match(/(?:tax|sales tax|hst|gst)[:\s]+\$?\s*([\d,]+\.?\d{0,2})/i);
  tax = taxMatch ? parseFloat(taxMatch[1].replace(',', '')) : 0;

  // Extract tip
  const tipMatch = text.match(/(?:tip|gratuity)[:\s]+\$?\s*([\d,]+\.?\d{0,2})/i);
  tip = tipMatch ? parseFloat(tipMatch[1].replace(',', '')) : 0;

  // Extract total
  const totalMatch = text.match(/(?:total|grand total|amount due|balance)[:\s]+\$?\s*([\d,]+\.?\d{0,2})/i);
  total = totalMatch ? parseFloat(totalMatch[1].replace(',', '')) : 0;

  // Calculate missing values if needed
  if (!subtotal && items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  if (!total && subtotal > 0) {
    total = subtotal + tax + tip;
  }

  // Check if subtotal matches items total
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculatedTotal = itemsTotal + tax + tip;
  const subtotalDiff = Math.abs(subtotal - calculatedTotal);
  
  // Set error if subtotal doesn't match (allow 0.01 tolerance for floating point)
  let error: string | undefined;
  if (subtotalDiff > 0.01 && items.length > 0) {
    error = "subtotal_mismatch";
  }

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    tip: parseFloat(tip.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    error
  };
}

