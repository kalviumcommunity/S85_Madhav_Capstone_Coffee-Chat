const Event = require('../models/Event');
const User=require("../models/User")
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, createdBy } = req.body;

    // Validate the user who is creating the event
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      createdBy,
    });

    await newEvent.save();

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (err) {
    res.status(500).json({ message: 'Error creating event', error: err });
  }
};

module.exports = { getAllEvents,createEvent };
