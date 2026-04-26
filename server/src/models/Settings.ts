import db from '../database/connection.js';
import type { Setting } from '../types/index.js';

export class SettingsModel {
  // Get settings (always returns one record)
  static get(): Setting {
    let settings = db.prepare('SELECT * FROM settings LIMIT 1').get() as Setting | undefined;
    
    if (!settings) {
      // Create default settings if none exists
      db.prepare(`
        INSERT INTO settings (shop_name, invoice_prefix)
        VALUES ('My Shop', 'INV')
      `).run();
      
      settings = db.prepare('SELECT * FROM settings LIMIT 1').get() as Setting;
    }

    return settings;
  }

  // Create or update settings
  static save(data: {
    shop_name: string;
    mobile?: string;
    address?: string;
    gstin?: string;
    invoice_prefix?: string;
  }): Setting {
    const existing = db.prepare('SELECT * FROM settings LIMIT 1').get() as Setting | undefined;

    if (existing) {
      // Update existing
      const updateFields: string[] = [];
      const values: any[] = [];

      if (data.shop_name !== undefined) {
        updateFields.push('shop_name = ?');
        values.push(data.shop_name);
      }
      if (data.mobile !== undefined) {
        updateFields.push('mobile = ?');
        values.push(data.mobile);
      }
      if (data.address !== undefined) {
        updateFields.push('address = ?');
        values.push(data.address);
      }
      if (data.gstin !== undefined) {
        updateFields.push('gstin = ?');
        values.push(data.gstin);
      }
      if (data.invoice_prefix !== undefined) {
        updateFields.push('invoice_prefix = ?');
        values.push(data.invoice_prefix);
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        db.prepare(`UPDATE settings SET ${updateFields.join(', ')}`).run(...values);
      }
    } else {
      // Create new
      db.prepare(`
        INSERT INTO settings (shop_name, mobile, address, gstin, invoice_prefix)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        data.shop_name,
        data.mobile || null,
        data.address || null,
        data.gstin || null,
        data.invoice_prefix || 'INV'
      );
    }

    return this.get();
  }

  // Update specific fields
  static update(data: Partial<Setting>): Setting | undefined {
    const existing = db.prepare('SELECT * FROM settings LIMIT 1').get() as Setting | undefined;
    
    if (!existing) return undefined;

    return this.save({
      shop_name: data.shop_name || existing.shop_name,
      mobile: data.mobile,
      address: data.address,
      gstin: data.gstin,
      invoice_prefix: data.invoice_prefix,
    });
  }
}