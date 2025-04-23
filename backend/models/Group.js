const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // array of User references
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // reference to the user who created the group
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
