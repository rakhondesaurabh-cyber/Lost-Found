import express from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  updateItemStatus,
  deleteItem,
  getMatches,
  getLiveMatches,
  getStats
} from '../controllers/itemController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getItems);
router.get('/stats', getStats);
router.get('/live-matches', getLiveMatches);
router.get('/:id', optionalAuth, getItemById);
router.get('/:id/matches', getMatches);

router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.patch('/:id/status', protect, updateItemStatus);
router.delete('/:id', protect, deleteItem);

export default router;
