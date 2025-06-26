const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Sports', 'Music', 'Art', 'Food', 'Travel', 'Business', 'Education', 'Health', 'Social', 'Other']
  },
  date: { 
    type: Date, 
    required: true 
  },
  endDate: {
    type: Date
  },
  time: {
    start: String,
    end: String
  },
  city: { 
    type: String, 
    required: true,
    trim: true
  },
  location: {
    address: String,
    venue: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  image: { 
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  maxAttendees: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  attendees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  interested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notAttending: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  tags: [{
    type: String,
    trim: true
  }],
  price: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    isFree: {
      type: Boolean,
      default: true
    }
  },
  chatEnabled: {
    type: Boolean,
    default: true
  },
  rsvpRequired: {
    type: Boolean,
    default: false
  },
  allowWaitlist: {
    type: Boolean,
    default: false
  },
  waitlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true 
});

// Indexes for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1, city: 1 });
eventSchema.index({ group: 1 });
eventSchema.index({ tags: 1 });

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.length;
});

// Virtual for interested count
eventSchema.virtual('interestedCount').get(function() {
  return this.interested.length;
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  if (this.maxAttendees === 0) return false;
  return this.attendees.length >= this.maxAttendees;
});

module.exports = mongoose.model('Event', eventSchema);
