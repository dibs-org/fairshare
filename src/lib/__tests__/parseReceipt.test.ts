import { parseReceiptText } from '../parseReceipt';

describe('parseReceiptText', () => {
  it('should parse items with prices ending in letters (C, B)', () => {
    const receiptText = `TABLE	10	
2 COUVERT HECTAR	
1 SOUPE AU PISTOU	16.00 C	
1 CAILLE DES VOSGES	16.00 C	
1 PAULOVA	13.00	
1 ECHINE DE COCHON	29.00 C	
1 GNOCCHIS VIN JAUNE	27.00 C	
1 DIVERS LIQUIDES 20%	59.00 B`;

    const result = parseReceiptText(receiptText);

    expect(result.items).toHaveLength(6);
    expect(result.items[0].name).toBe('soupe au pistou');
    expect(result.items[0].price).toBe(16.00);
    expect(result.items[1].name).toBe('caille des vosges');
    expect(result.items[1].price).toBe(16.00);
    expect(result.items[2].name).toBe('paulova');
    expect(result.items[2].price).toBe(13.00);
    expect(result.items[3].name).toBe('echine de cochon');
    expect(result.items[3].price).toBe(29.00);
    expect(result.items[4].name).toBe('gnocchis vin jaune');
    expect(result.items[4].price).toBe(27.00);
    expect(result.items[5].name).toBe('divers liquides');
    expect(result.items[5].price).toBe(59.00);
  });

  it('should handle items with quantities', () => {
    const receiptText = `2x Burger	12.00
1 Fries	5.00`;

    const result = parseReceiptText(receiptText);

    expect(result.items).toHaveLength(3); // 2 burgers + 1 fries
    expect(result.items[0].name).toBe('burger');
    expect(result.items[0].price).toBe(6.00); // Unit price
    expect(result.items[1].name).toBe('burger');
    expect(result.items[1].price).toBe(6.00);
    expect(result.items[2].name).toBe('fries');
    expect(result.items[2].price).toBe(5.00);
  });

  it('should extract subtotal, tax, tip, and total', () => {
    const receiptText = `Burger	10.00
Fries	5.00
Subtotal: 15.00
Tax: 1.20
Tip: 3.00
Total: 19.20`;

    const result = parseReceiptText(receiptText);

    expect(result.subtotal).toBe(15.00);
    expect(result.tax).toBe(1.20);
    expect(result.tip).toBe(3.00);
    // Total should be extracted from the text (19.20), or calculated from subtotal + tax + tip if not found
    expect(result.total).toBe(19.20);
  });

  it('should calculate subtotal from items if not found', () => {
    const receiptText = `Burger	10.00
Fries	5.00`;

    const result = parseReceiptText(receiptText);

    expect(result.subtotal).toBe(15.00);
  });

  it('should calculate total from subtotal + tax + tip if not found', () => {
    const receiptText = `Burger	10.00
Tax: 1.20
Tip: 2.00`;

    const result = parseReceiptText(receiptText);

    expect(result.total).toBe(13.20); // 10 + 1.20 + 2.00
  });

  it('should handle items without prices', () => {
    const receiptText = `2 COUVERT HECTAR	
1 SOUPE AU PISTOU	16.00 C`;

    const result = parseReceiptText(receiptText);

    // Should only pick up items with prices
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('soupe au pistou');
  });

  it('should skip lines with total/tax/tip keywords', () => {
    const receiptText = `Burger	10.00
Total: 10.00
Tax: 1.00
Tip: 2.00`;

    const result = parseReceiptText(receiptText);

    // Should not create items from "Total", "Tax", "Tip" lines
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('burger');
  });

  it('should handle column-based receipt format with multi-line items', () => {
    const receiptText = `Bill No.: 5365	Persons: 2	

No. Item	Qty.	Price	Amount	

Water Bottle	

1	1	30.00	30.00	

(packeged)	

Crispy Chilli	

2	1	170.00	170.00	

Baby Corn	

Kashmiri	

3	1	130.00	130.00	

Pulao	

Kadai	

4	1	250.00	250.00	

Chicken	

Mutton	

5	1	220.00	220.00	

Biriyani	

6 Soft Drinks	1	40.00	40.00	

Sub	

Total Qty: 6	Total	840.00	`;

    const result = parseReceiptText(receiptText);

    expect(result.items.length).toBeGreaterThanOrEqual(6);
    // Check first few items
    expect(result.items[0].name.toLowerCase()).toContain('water bottle');
    expect(result.items[0].price).toBe(30.00);
    expect(result.items[1].name.toLowerCase()).toContain('crispy chilli');
    expect(result.items[1].price).toBe(170.00);
    // Find items by checking names
    const kashmiriItem = result.items.find(item => item.name.toLowerCase().includes('kashmiri'));
    expect(kashmiriItem).toBeDefined();
    expect(kashmiriItem?.price).toBe(130.00);
    const kadaiItem = result.items.find(item => item.name.toLowerCase().includes('kadai'));
    expect(kadaiItem).toBeDefined();
    expect(kadaiItem?.price).toBe(250.00);
    const muttonItem = result.items.find(item => item.name.toLowerCase().includes('mutton'));
    expect(muttonItem).toBeDefined();
    expect(muttonItem?.price).toBe(220.00);
    const softDrinksItem = result.items.find(item => item.name.toLowerCase().includes('soft drink'));
    expect(softDrinksItem).toBeDefined();
    expect(softDrinksItem?.price).toBe(40.00);
    expect(result.total).toBe(840.00);
  });

  it('should handle items with quantity prefix and price on separate line', () => {
    const receiptText = `11-14-25 8:30PM	$12.00	

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

Items: 5	`;

    const result = parseReceiptText(receiptText);

    expect(result.items.length).toBeGreaterThanOrEqual(4);
    // Find items by checking names
    const crabItem = result.items.find(item => (item.name.includes('crab') || item.name.includes('pork')) && !item.name.includes('vegetable'));
    expect(crabItem).toBeDefined();
    if (crabItem) {
      expect(crabItem.price).toBe(12.00);
    }
    
    const soupItem = result.items.find(item => item.name.includes('vegetable soup') || (item.name.includes('dumpling') && !item.name.includes('crab') && !item.name.includes('soup dumpling')));
    expect(soupItem).toBeDefined();
    if (soupItem) {
      expect(soupItem.price).toBe(10.75);
    }
    
    const happinessItem = result.items.find(item => item.name.includes('happiness') || item.name.includes('kaofu'));
    expect(happinessItem).toBeDefined();
    if (happinessItem) {
      expect(happinessItem.price).toBe(12.95);
    }
    
    const pepsiItem = result.items.find(item => item.name.includes('pepsi'));
    expect(pepsiItem).toBeDefined();
    if (pepsiItem) {
      expect(pepsiItem.price).toBe(2.95);
    }
    
    // Check for Vegetable Crispy Noodle (may not have a price)
    const noodleItem = result.items.find(item => 
      (item.name.includes('vegetable crispy') || item.name.includes('crispy')) && 
      (item.name.includes('noodle') || item.name.includes('noodle'))
    );
    expect(noodleItem).toBeDefined();
    if (noodleItem) {
      // It may have price 0 if no price was found
      expect(noodleItem.price).toBe(0);
    }
  });
});

