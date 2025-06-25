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
  deleteGroup 
} = require('../controllers/groupController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getAllGroups);
router.get('/:id', getGroupById);
router.get('/:id/members', getGroupMembers);

// Protected routes
router.get('/user/groups', auth, getUserGroups);
router.post('/creategroup', auth, createGroup);
router.post('/:id/join', auth, joinGroup);
router.post('/:id/leave', auth, leaveGroup);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, deleteGroup);

module.exports = router;
