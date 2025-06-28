const Event = require('../models/Event');
const User = require('../models/User');

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email profileImage')
      .populate('attendees', 'name email profileImage');

    // Add attendee count and check if current user is attending
    const eventsWithCounts = events.map(event => {
      const eventObj = event.toObject();
      eventObj.attendeeCount = event.attendees.length;
      
      // Check if current user is attending
      if (req.user && req.user.userId) {
        eventObj.isAttending = event.attendees.some(attendee => 
          attendee._id.toString() === req.user.userId.toString()
        );
      }
      
      return eventObj;
    });

    res.status(200).json(eventsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email profileImage')
      .populate('attendees', 'name email profileImage location');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventObj = event.toObject();
    eventObj.attendeeCount = event.attendees.length;
    
    // Check if current user is attending
    if (req.user && req.user.userId) {
      eventObj.isAttending = event.attendees.some(attendee => 
        attendee._id.toString() === req.user.userId.toString()
      );
    }

    res.status(200).json(eventObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error });
  }
};

const getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('attendees', 'name email profileImage location');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event.attendees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event attendees', error });
  }
};

const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user.userId })
      .populate('createdBy', 'name email profileImage')
      .populate('attendees', 'name email profileImage');

    const eventsWithCounts = events.map(event => {
      const eventObj = event.toObject();
      eventObj.attendeeCount = event.attendees.length;
      eventObj.isAttending = true; // User is definitely attending
      return eventObj;
    });

    res.status(200).json(eventsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user events', error });
  }
};

const createEvent = async (req, res) => {
  try {
    const { name, description, category, city, date, image } = req.body;

    // Validate required fields
    if (!name || !description || !category || !city || !date) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, description, category, city, and date are required' 
      });
    }

    const newEvent = new Event({
      name,
      description,
      category,
      city,
      date,
      image,
      createdBy: req.user.userId, // Use userId from JWT token
      attendees: [req.user.userId] // Creator is automatically attending
    });

    await newEvent.save();

    // Populate the created event with user details
    const populatedEvent = await Event.findById(newEvent._id)
      .populate('createdBy', 'name email profileImage')
      .populate('attendees', 'name email profileImage');

    res.status(201).json(populatedEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
};

const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already attending
    if (event.attendees.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already attending this event' });
    }

    event.attendees.push(req.user.userId);
    await event.save();

    res.status(200).json({ message: 'Successfully joined event' });
  } catch (error) {
    res.status(500).json({ message: 'Error joining event', error });
  }
};

const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove user from attendees array
    event.attendees = event.attendees.filter(attendeeId => 
      attendeeId.toString() !== req.user.userId.toString()
    );
    
    await event.save();

    res.status(200).json({ message: 'Successfully left event' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving event', error });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('createdBy', 'name email profileImage')
     .populate('attendees', 'name email profileImage');

    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: 'Error updating event', error: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getEventAttendees,
  getUserEvents,
  createEvent,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent
};
