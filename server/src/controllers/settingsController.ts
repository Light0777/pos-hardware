import type { Request, Response } from 'express';
import { SettingsModel } from '../models/Settings.js';
import type { AuthRequest } from '../middleware/auth.js';

export class SettingsController {
  // GET settings
  static get = (req: AuthRequest, res: Response): void => {
    try {
      const settings = SettingsModel.get();

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  };

  // CREATE or UPDATE settings
  static save = (req: AuthRequest, res: Response): void => {
    try {
      const { shop_name, mobile, address, gstin, invoice_prefix } = req.body;

      if (!shop_name) {
        res.status(400).json({ 
          success: false, 
          error: 'Shop name is required' 
        });
        return;
      }

      const settings = SettingsModel.save({
        shop_name: String(shop_name),
        mobile: mobile ? String(mobile) : undefined,
        address: address ? String(address) : undefined,
        gstin: gstin ? String(gstin) : undefined,
        invoice_prefix: invoice_prefix ? String(invoice_prefix) : undefined,
      });

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Save settings error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  };

  // UPDATE settings (explicit update)
  static update = (req: AuthRequest, res: Response): void => {
    try {
      const updates = req.body;
      const settings = SettingsModel.update(updates);

      if (!settings) {
        res.status(404).json({ 
          success: false, 
          message: 'Settings not found' 
        });
        return;
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  };
}