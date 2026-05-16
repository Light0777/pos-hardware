// ─── Tally XML Parser ───────────────────────────────────────────────
// Tally exports stock items like:
// <STOCKITEM NAME="Product Name">
//   <RATE>100/Nos</RATE>
//   <OPENINGBALANCE>50 Nos</OPENINGBALANCE>
//   <GSTDETAILS><TAXABILITY>Taxable</TAXABILITY><GSTRATE>18</GSTRATE></GSTDETAILS>
// </STOCKITEM>

export function parseTallyXML(xmlString: string): any[] {
    const products: any[] = [];

    // ── Format 1: <STOCKITEM NAME="Product"> (attribute style) ──
    const attrRegex = /<STOCKITEM NAME="([^"]+)"[^>]*>([\s\S]*?)<\/STOCKITEM>/gi;
    let match;
    while ((match = attrRegex.exec(xmlString)) !== null) {
        const name = match[1].trim();
        const body = match[2];
        const product = extractTallyFields(name, body);
        if (product) products.push(product);
    }

    // ── Format 2: <NAME> as child tag ──
    if (products.length === 0) {
        const tagRegex = /<STOCKITEM[^>]*>([\s\S]*?)<\/STOCKITEM>/gi;
        while ((match = tagRegex.exec(xmlString)) !== null) {
            const body = match[1];
            const nameMatch = body.match(/<NAME[^>]*>([^<]+)<\/NAME>/i);
            if (!nameMatch) continue;
            const name = nameMatch[1].trim();
            const product = extractTallyFields(name, body);
            if (product) products.push(product);
        }
    }

    return products;
}

function extractTallyFields(name: string, body: string): any | null {
    // Price: try <RATE> first, then calculate from OPENINGVALUE / OPENINGBALANCE
    let price = 0;
    const rateMatch = body.match(/<RATE[^>]*>([\d.]+)\/?/i);
    if (rateMatch) {
        price = parseFloat(rateMatch[1]);
    } else {
        const valueMatch = body.match(/<OPENINGVALUE[^>]*>([\d.]+)/i);
        const balanceMatch = body.match(/<OPENINGBALANCE[^>]*>([\d.]+)/i);
        if (valueMatch && balanceMatch) {
            const qty = parseFloat(balanceMatch[1]);
            price = qty > 0 ? parseFloat(valueMatch[1]) / qty : 0;
        }
    }

    // Stock quantity
    const stockMatch = body.match(/<OPENINGBALANCE[^>]*>([\d.]+)/i);
    const stock = stockMatch ? Math.floor(parseFloat(stockMatch[1])) : 0;

    // GST — try multiple tag names Tally uses
    const gstMatch = body.match(/<(?:GSTRATE|TAXRATE|RATEOFVAT)[^>]*>([\d.]+)/i);
    const gst_percent = gstMatch ? parseFloat(gstMatch[1]) : 0;

    // HSN
    const hsnMatch = body.match(/<HSNCODE[^>]*>([^<]+)/i);
    const hsn_code = hsnMatch ? hsnMatch[1].trim() : '';

    if (!name || price === 0) return null;

    return { name, price: Math.round(price * 100) / 100, stock, gst_percent, hsn_code, sku: '', barcode: '' };
}

// ─── Vyapar CSV/XLSX Parser ─────────────────────────────────────────
// Vyapar exports with headers like:
// Item Name, Sale Price, Purchase Price, Stock Quantity, Item Code, GST Tax Rate, HSN/SAC Code

export function parseVyaparFile(content: string, fileType: string): any[] {
    // For xlsx, content arrives as a JSON string array of rows (see frontend note)
    // For csv, content is raw CSV text

    let rows: string[][];

    if (fileType === 'vyapar-xlsx') {
        rows = JSON.parse(content); // pre-parsed on frontend
    } else {
        rows = parseCSV(content);
    }

    if (rows.length < 2) return [];

    // Normalize headers
    const headers = rows[0].map(h => h.toLowerCase().trim());

    const col = (name: string) => {
        const patterns: Record<string, string[]> = {
            name: ['item name', 'product name', 'name', 'item'],
            price: ['sale price', 'selling price', 'price', 'mrp'],
            stock: ['stock quantity', 'stock', 'quantity', 'opening stock'],
            sku: ['item code', 'sku', 'code', 'product code'],
            barcode: ['barcode', 'bar code', 'barcode number'],
            gst_percent: ['gst tax rate', 'gst rate', 'tax rate', 'gst%'],
            hsn_code: ['hsn/sac code', 'hsn code', 'hsn', 'sac code'],
        };
        for (const pattern of patterns[name]) {
            const idx = headers.indexOf(pattern);
            if (idx !== -1) return idx;
        }
        return -1;
    };

    return rows.slice(1)
        .filter(row => row.some(cell => cell?.trim()))
        .map(row => ({
            name: row[col('name')]?.trim() || '',
            price: parseFloat(row[col('price')] || '0') || 0,
            stock: Math.floor(parseFloat(row[col('stock')] || '0')) || 0,
            sku: row[col('sku')]?.trim() || '',
            barcode: row[col('barcode')]?.trim() || '',
            gst_percent: parseFloat(row[col('gst_percent')] || '0') || 0,
            hsn_code: row[col('hsn_code')]?.trim() || '',
        }))
        .filter(p => p.name && p.price > 0);
}

function parseCSV(text: string): string[][] {
    return text.split('\n').map(line => {
        const row: string[] = [];
        let cur = '', inQuote = false;
        for (const ch of line) {
            if (ch === '"') { inQuote = !inQuote; }
            else if (ch === ',' && !inQuote) { row.push(cur); cur = ''; }
            else { cur += ch; }
        }
        row.push(cur);
        return row.map(c => c.trim().replace(/\r$/, ''));
    });
}