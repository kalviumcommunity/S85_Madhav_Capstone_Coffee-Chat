const Group = require('../models/Group');

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error });
  }
};

module.exports = { getAllGroups };
