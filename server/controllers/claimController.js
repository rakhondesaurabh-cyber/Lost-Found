import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';

export const createClaim = (req, res) => {
  try {
    const { itemId, message, contactPhone } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({ success: false, message: 'Item ID and verification message are required' });
    }

    const item = db.getItemById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check if claimant is the item reporter
    if (item.reportedBy._id === req.user._id) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own reported item' });
    }

    // Check if already claimed by this user
    const userClaims = db.getClaimsForUser(req.user._id);
    const existing = userClaims.sent.find(c => c.itemId === itemId && c.status === 'PENDING');
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending claim for this item' });
    }

    const newClaim = {
      _id: `claim_${uuidv4().substring(0, 8)}`,
      itemId: item._id,
      itemTitle: item.title,
      itemType: item.type,
      itemCategory: item.category,
      itemImageUrl: item.imageUrl,
      itemLocation: item.location,
      claimantId: req.user._id,
      claimantName: req.user.name,
      claimantEmail: req.user.email,
      claimantAvatar: req.user.avatar,
      claimantPhone: contactPhone || req.user.phone || '',
      ownerId: item.reportedBy._id,
      ownerName: item.reportedBy.name,
      ownerEmail: item.reportedBy.email,
      message: message.trim(),
      status: 'PENDING', // PENDING | ACCEPTED | REJECTED
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createClaim(newClaim);

    return res.status(201).json({
      success: true,
      message: 'Claim request sent to the owner successfully! They will review your verification details.',
      claim: newClaim
    });
  } catch (error) {
    console.error('createClaim error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create claim request' });
  }
};

export const getMyClaims = (req, res) => {
  try {
    const claims = db.getClaimsForUser(req.user._id);
    return res.json({
      success: true,
      claims
    });
  } catch (error) {
    console.error('getMyClaims error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user claims' });
  }
};

export const updateClaimStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body; // status: 'ACCEPTED' | 'REJECTED'

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be ACCEPTED or REJECTED' });
    }

    const claim = db.getClaimById(id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim request not found' });
    }

    // Verify only the item owner can accept/reject
    if (claim.ownerId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this claim' });
    }

    const updatedClaim = db.updateClaimStatus(id, status);

    // If accepted, also transition item status to CLAIMED
    if (status === 'ACCEPTED') {
      db.updateItem(claim.itemId, { status: 'CLAIMED' });
    }

    return res.json({
      success: true,
      message: `Claim request ${status.toLowerCase()} successfully`,
      claim: updatedClaim
    });
  } catch (error) {
    console.error('updateClaimStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update claim status' });
  }
};
