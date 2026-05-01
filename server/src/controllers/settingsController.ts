import type { Request, Response } from 'express';
import { SettingsModel } from '../models/Settings';
import type { AuthRequest } from '../middleware/auth';
import { createBackup, listBackups, restoreBackup } from '../database/backup';

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
      const { shop_name, mobile, address, gstin, invoice_prefix, auto_print } = req.body;

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
        auto_print: auto_print !== undefined ? Number(auto_print) : undefined,
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

  // In backup method, remove the parameter since your createBackup has a default parameter
  static backup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const backupPath = createBackup('manual'); // This is fine - 'manual' is a valid label
      const backups = listBackups();
      res.json({
        success: true,
        message: 'Backup created successfully',
        data: { backupPath, backups }
      });
    } catch (error: any) {
      console.error('Backup error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  static listBackups = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const backups = await listBackups();
      res.json({ success: true, data: backups });
    } catch (error: any) {
      console.error('List backups error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  static restore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { backup_name } = req.body;
      if (!backup_name) {
        res.status(400).json({ success: false, error: 'backup_name is required' });
        return;
      }
      await restoreBackup(backup_name);
      res.json({ success: true, message: 'Database restored successfully. Please restart the app.' });
    } catch (error: any) {
      console.error('Restore error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
}