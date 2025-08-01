const express = require('express');
const router = express.Router();
const { 
  getAllEvents, 
  getEventById, 
  getEventAttendees, 
  getUserEvents,
  createEvent, 
  rsvpToEvent,
  joinEvent, 
  leaveEvent,
  updateEvent, 
  deleteEvent,
  bookmarkEvent
} = require('../controllers/eventController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getAllEvents);

// Add featured events route BEFORE /:id route
router.get('/featured', async (req, res) => {
  try {
    const Event = require('../models/Event');
    const featuredEvents = await Event.find({ isActive: true, isPublic: true, status: 'upcoming' })
      .sort({ date: 1 })
      .limit(5)
      .populate('createdBy', 'name email profileImage')
      .populate('attendees', 'name email profileImage');
    
    const eventsWithCounts = featuredEvents.map(event => {
      const eventObj = event.toObject();
      eventObj.attendeeCount = event.attendees.length;
      return eventObj;
    });
    
    res.json(eventsWithCounts);
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ error: 'Failed to fetch featured events' });
  }
});

router.get('/:id', getEventById);
router.get('/:id/attendees', getEventAttendees);

// Protected routes
router.get('/user/events', auth, getUserEvents);

// Event management
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);

// RSVP and attendance
router.post('/:id/rsvp', auth, rsvpToEvent);
router.post('/:id/join', auth, joinEvent);
router.post('/:id/leave', auth, leaveEvent);

// Bookmark/Unbookmark event
router.post('/:id/bookmark', auth, bookmarkEvent);

module.exports = router;
