const Group = require('../models/Group');
const User = require('../models/User');


const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error });
  }
};
exports.createGroup = async (req, res) => {
  try {
    const { name, description, members, createdBy } = req.body;

    // Validate the user who is creating the group
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newGroup = new Group({
      name,
      description,
      members,
      createdBy,
    });

    await newGroup.save();

    res.status(201).json({ message: 'Group created successfully', group: newGroup });
  } catch (err) {
    res.status(500).json({ message: 'Error creating group', error: err });
  }
};

module.exports = { getAllGroups,createGroup };
