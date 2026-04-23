import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/client.controller';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();

router
  .route('/')
  .get(getAllClients)
  .post(
    [
      body('name').notEmpty().withMessage('Name is required').trim(),
      body('phone').notEmpty().withMessage('Phone is required').trim(),
      body('email').optional().isEmail().withMessage('Invalid email').trim(),
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
      body('email').optional().isEmail().withMessage('Invalid email').trim(),
      body('notes').optional().trim(),
    ],
    handleValidationErrors,
    updateClient
  )
  .delete(deleteClient);

export default router;