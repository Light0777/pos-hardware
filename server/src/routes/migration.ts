import express from 'express';
import { ProductModel } from '../models/Product';
import { parseTallyXML, parseVyaparFile } from '../utils/migrationParsers';

const router = express.Router();

// Preview — parse file and return products without saving
router.post('/preview', async (req, res) => {
  try {
    const { fileContent, fileType, fileName } = req.body;
    // fileType: 'tally-xml' | 'vyapar-csv' | 'vyapar-xlsx'

    let products = [];

    if (fileType === 'tally-xml') {
      products = parseTallyXML(fileContent);
    } else if (fileType === 'vyapar-csv' || fileType === 'vyapar-xlsx') {
      products = parseVyaparFile(fileContent, fileType);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }

    res.json({ success: true, data: products, count: products.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Confirm — actually insert into DB
router.post('/confirm', async (req, res) => {
  try {
    const { products, onDuplicate } = req.body;
    // onDuplicate: 'skip' | 'overwrite'

    const toInsert = [];
    const skipped = [];

    for (const p of products) {
      const exists = p.sku ? ProductModel.findBySku(p.sku) : 
                     p.barcode ? ProductModel.findByBarcode(p.barcode) : null;

      if (exists) {
        if (onDuplicate === 'overwrite') {
          ProductModel.update(exists.product_uuid, p);
        } else {
          skipped.push(p.name);
        }
      } else {
        toInsert.push(p);
      }
    }

    const inserted = toInsert.length > 0 ? ProductModel.bulkCreate(toInsert) : 0;

    res.json({
      success: true,
      data: { inserted, skipped: skipped.length, overwritten: products.length - toInsert.length - skipped.length }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;