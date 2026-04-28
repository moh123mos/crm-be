import { type Router as RouterType } from 'express';
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
  exportClients,
  importClients,
} from '../controllers/client.controller';
import { handleValidationErrors } from '../middleware/validate';

const router: RouterType = Router();

router.route('/export').get(exportClients);

router.route('/import').post(importClients);

router
  .route('/')
  .get(getAllClients)
  .post(
    [
      body('name').notEmpty().withMessage('Name is required').trim(),
      body('phone').notEmpty().withMessage('Phone is required').trim(),
      body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email').trim(),
      body('address').optional().trim(),
      body('notes').optional().trim(),
    ],
    handleValidationErrors,
    createClient
  );

router
  .route('/:id')
  .put(
    [
      body('name').optional().trim(),
      body('phone').optional().trim(),
      body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email').trim(),
      body('address').optional().trim(),
      body('notes').optional().trim(),
    ],
    handleValidationErrors,
    updateClient
  )
  .delete(deleteClient);

export default router;