const express = require('express');
const router = express.Router();
const { 
  getAllEvents, 
  getEventById, 
  getEventAttendees, 
  getUserEvents,
  createEvent, 
  joinEvent, 
  leaveEvent,
  updateEvent, 
  deleteEvent 
} = require('../controllers/eventController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.get('/:id/attendees', getEventAttendees);

// Protected routes
router.get('/user/events', auth, getUserEvents);
router.post('/createevent', auth, createEvent);
router.post('/:id/join', auth, joinEvent);
router.post('/:id/leave', auth, leaveEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);

module.exports = router;
