const express = require('express');
const router = express.Router();
const { 
  getAllGroups, 
  getGroupById, 
  getGroupMembers, 
  getUserGroups,
  createGroup, 
  joinGroup, 
  leaveGroup,
  updateGroup, 
  deleteGroup,
  bookmarkGroup
} = require('../controllers/groupController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getAllGroups);

// Add featured groups route BEFORE /:id route
router.get('/featured', async (req, res) => {
  try {
    const Group = require('../models/Group');
    const featuredGroups = await Group.find({ isActive: true, privacy: 'public' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email profileImage')
      .populate('members', 'name email profileImage');
    
    const groupsWithCounts = featuredGroups.map(group => {
      const groupObj = group.toObject();
      groupObj.memberCount = group.members.length;
      return groupObj;
    });
    
    res.json(groupsWithCounts);
  } catch (error) {
    console.error('Error fetching featured groups:', error);
    res.status(500).json({ error: 'Failed to fetch featured groups' });
  }
});

router.get('/:id', getGroupById);
router.get('/:id/members', getGroupMembers);

// Protected routes
router.get('/user/groups', auth, getUserGroups);
router.post('/', auth, createGroup);
router.post('/:id/join', auth, joinGroup);
router.post('/:id/leave', auth, leaveGroup);
router.post('/:id/bookmark', auth, bookmarkGroup);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, deleteGroup);

module.exports = router;
