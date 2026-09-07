import express from 'express';
import { createClaim, getMyClaims, updateClaimStatus } from '../controllers/claimController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All claim operations require auth

router.post('/', createClaim);
router.get('/my-claims', getMyClaims);
router.patch('/:id/status', updateClaimStatus);

export default router;
