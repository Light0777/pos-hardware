import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All settings routes require authentication
router.use(authenticate);

// GET settings (any authenticated user)
router.get('/', SettingsController.get);

// POST save settings (owner only)
router.post('/', authorize('owner'), SettingsController.save);

// PUT update settings (owner only)
router.put('/', authorize('owner'), SettingsController.update);

export default router;