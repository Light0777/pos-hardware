import { Router } from 'express';
import { SaleController } from '../controllers/saleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All sale routes require authentication
router.use(authenticate);

// List sales and get single sale
router.get('/', SaleController.index);
router.get('/:sale_uuid', SaleController.show);

export default router;