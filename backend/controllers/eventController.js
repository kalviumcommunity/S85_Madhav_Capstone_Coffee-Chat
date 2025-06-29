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
        eventObj.isInterested = event.interested?.some(user => 
          user._id.toString() === req.user.userId.toString()
        );
        eventObj.isOnWaitlist = event.waitlist?.some(user => 
          user._id.toString() === req.user.userId.toString()
        );
        eventObj.isNotAttending = event.notAttending?.some(user => 
          user._id.toString() === req.user.userId.toString()
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
      .populate('attendees', 'name email profileImage location')
      .populate('interested', 'name email profileImage')
      .populate('waitlist', 'name email profileImage');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventObj = event.toObject();
    eventObj.attendeeCount = event.attendees.length;
    eventObj.interestedCount = event.interested?.length || 0;
    eventObj.waitlistCount = event.waitlist?.length || 0;
    
    // Check if current user is attending/interested/on waitlist
    if (req.user && req.user.userId) {
      eventObj.isAttending = event.attendees.some(attendee => 
        attendee._id.toString() === req.user.userId.toString()
      );
      eventObj.isInterested = event.interested?.some(user => 
        user._id.toString() === req.user.userId.toString()
      );
      eventObj.isOnWaitlist = event.waitlist?.some(user => 
        user._id.toString() === req.user.userId.toString()
      );
      eventObj.isNotAttending = event.notAttending?.some(user => 
        user._id.toString() === req.user.userId.toString()
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
    const { name, description, category, city, date, image, maxAttendees, rsvpRequired, allowWaitlist } = req.body;

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
      maxAttendees: maxAttendees || 0,
      rsvpRequired: rsvpRequired || false,
      allowWaitlist: allowWaitlist || false,
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

// Enhanced RSVP functionality
const rsvpToEvent = async (req, res) => {
  try {
    const { rsvpType } = req.body; // 'attending', 'interested', 'not-attending', 'not-interested'
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userId = req.user.userId;

    // Handle different RSVP types
    switch (rsvpType) {
      case 'attending':
        // Check if user is already attending, if so remove them (toggle off)
        if (event.attendees.some(attendeeId => attendeeId.toString() === userId.toString())) {
          event.attendees = event.attendees.filter(attendeeId => 
            attendeeId.toString() !== userId.toString()
          );
          await event.save();
          return res.status(200).json({ 
            message: 'Removed from attending',
            status: 'not-attending'
          });
        }
        
        // Remove from other arrays first
        event.interested = event.interested?.filter(user => 
          user.toString() !== userId.toString()
        ) || [];
        event.waitlist = event.waitlist?.filter(user => 
          user.toString() !== userId.toString()
        ) || [];
        event.notAttending = event.notAttending?.filter(user => 
          user.toString() !== userId.toString()
        ) || [];
        
        // Check if event is full
        if (event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees) {
          if (event.allowWaitlist) {
            event.waitlist.push(userId);
            await event.save();
            return res.status(200).json({ 
              message: 'Event is full. You have been added to the waitlist.',
              status: 'waitlist'
            });
          } else {
            return res.status(400).json({ 
              message: 'Event is full and waitlist is not enabled.',
              status: 'full'
            });
          }
        }
        event.attendees.push(userId);
        break;

      case 'interested':
        // Check if user is already interested, if so remove them (toggle off)
        if (event.interested?.some(user => user.toString() === userId.toString())) {
          event.interested = event.interested.filter(user => 
            user.toString() !== userId.toString()
          );
          await event.save();
          return res.status(200).json({ 
            message: 'Removed from interested',
            status: 'not-interested'
          });
        }
        
        // Remove from other arrays first
        event.attendees = event.attendees.filter(attendeeId => 
          attendeeId.toString() !== userId.toString()
        );
        event.waitlist = event.waitlist?.filter(user => 
          user.toString() !== userId.toString()
        ) || [];
        event.notAttending = event.notAttending?.filter(user => 
          user.toString() !== userId.toString()
        ) || [];
        
        if (!event.interested) event.interested = [];
        event.interested.push(userId);
        break;

      case 'not-attending':
        // Remove from all arrays and add to notAttending
        event.attendees = event.attendees.filter(attendeeId => 
          attendeeId.toString() !== userId.toString()
        );
        event.interested = event.interested?.filter(user => 
          user.toString() !== userId.toString()
        ) || [];
        event.waitlist = event.waitlist?.filter(user => 
          user.toString() !== userId.toString()
        ) || [];
        
        if (!event.notAttending) event.notAttending = [];
        event.notAttending.push(userId);
        break;

      case 'not-interested':
        // Remove from interested array
        event.interested = event.interested?.filter(user => 
          user.toString() !== userId.toString()
        ) || [];
        break;

      default:
        return res.status(400).json({ message: 'Invalid RSVP type' });
    }

    await event.save();

    // Check if someone can be moved from waitlist to attendees
    if (rsvpType === 'not-attending' && event.waitlist && event.waitlist.length > 0) {
      const nextPerson = event.waitlist.shift();
      event.attendees.push(nextPerson);
      await event.save();
      
      // Notify the person who was moved from waitlist (you can implement notification logic here)
    }

    res.status(200).json({ 
      message: `Successfully marked as ${rsvpType}`,
      status: rsvpType
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing RSVP', error });
  }
};

const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userId = req.user.userId;

    // Check if user is already attending
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'Already attending this event' });
    }

    // Check if event is full
    if (event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees) {
      if (event.allowWaitlist) {
        event.waitlist.push(userId);
        await event.save();
        return res.status(200).json({ 
          message: 'Event is full. You have been added to the waitlist.',
          status: 'waitlist'
        });
      } else {
        return res.status(400).json({ 
          message: 'Event is full and waitlist is not enabled.',
          status: 'full'
        });
      }
    }

    event.attendees.push(userId);
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

    const userId = req.user.userId;

    // Remove user from attendees array
    event.attendees = event.attendees.filter(attendeeId => 
      attendeeId.toString() !== userId.toString()
    );
    
    // Also remove from interested and waitlist
    event.interested = event.interested?.filter(userId => 
      userId.toString() !== userId.toString()
    ) || [];
    event.waitlist = event.waitlist?.filter(userId => 
      userId.toString() !== userId.toString()
    ) || [];
    
    await event.save();

    // Check if someone can be moved from waitlist to attendees
    if (event.waitlist && event.waitlist.length > 0) {
      const nextPerson = event.waitlist.shift();
      event.attendees.push(nextPerson);
      await event.save();
      
      // Notify the person who was moved from waitlist
      res.status(200).json({ 
        message: 'Successfully left event. Someone from the waitlist has been moved to attendees.',
        status: 'left'
      });
    } else {
      res.status(200).json({ message: 'Successfully left event' });
    }
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
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event', error: err.message });
  }
};

// Bookmark/Unbookmark event
const bookmarkEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize bookmarkedEvents array if it doesn't exist
    if (!user.bookmarkedEvents) {
      user.bookmarkedEvents = [];
    }

    const isBookmarked = user.bookmarkedEvents.includes(event._id);
    
    if (isBookmarked) {
      // Remove from bookmarks
      user.bookmarkedEvents = user.bookmarkedEvents.filter(
        eventId => eventId.toString() !== event._id.toString()
      );
    } else {
      // Add to bookmarks
      user.bookmarkedEvents.push(event._id);
    }

    await user.save();

    res.status(200).json({ 
      message: isBookmarked ? 'Event removed from bookmarks' : 'Event bookmarked successfully',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error('Error bookmarking event:', error);
    res.status(500).json({ message: 'Error bookmarking event', error: error.message });
  }
};

module.exports = {
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
};
