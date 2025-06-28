const Group = require('../models/Group');
const User = require('../models/User');

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('createdBy', 'name email profileImage')
      .populate('members', 'name email profileImage');

    // Add member count and check if current user is a member
    const groupsWithCounts = groups.map(group => {
      const groupObj = group.toObject();
      groupObj.memberCount = group.members.length;
      
      // Check if current user is a member
      if (req.user && req.user.userId) {
        groupObj.isMember = group.members.some(member => 
          member._id.toString() === req.user.userId.toString()
        );
      }
      
      return groupObj;
    });

    res.status(200).json(groupsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'name email profileImage')
      .populate('members', 'name email profileImage location');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupObj = group.toObject();
    groupObj.memberCount = group.members.length;
    
    // Check if current user is a member
    if (req.user && req.user.userId) {
      groupObj.isMember = group.members.some(member => 
        member._id.toString() === req.user.userId.toString()
      );
    }

    res.status(200).json(groupObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group', error });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email profileImage location');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json(group.members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group members', error });
  }
};

const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.userId })
      .populate('createdBy', 'name email profileImage')
      .populate('members', 'name email profileImage');

    const groupsWithCounts = groups.map(group => {
      const groupObj = group.toObject();
      groupObj.memberCount = group.members.length;
      groupObj.isMember = true; // User is definitely a member
      return groupObj;
    });

    res.status(200).json(groupsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user groups', error });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description, category, city, image } = req.body;

    // Validate required fields
    if (!name || !description || !category || !city) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, description, category, and city are required' 
      });
    }

    const newGroup = new Group({
      name,
      description,
      category,
      city,
      image,
      createdBy: req.user.userId, // Use userId from JWT token
      members: [req.user.userId] // Creator is automatically a member
    });

    await newGroup.save();

    // Populate the created group with user details
    const populatedGroup = await Group.findById(newGroup._id)
      .populate('createdBy', 'name email profileImage')
      .populate('members', 'name email profileImage');

    res.status(201).json(populatedGroup);
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
};

const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    if (group.members.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    group.members.push(req.user.userId);
    await group.save();

    res.status(200).json({ message: 'Successfully joined group' });
  } catch (error) {
    res.status(500).json({ message: 'Error joining group', error });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Remove user from members array
    group.members = group.members.filter(memberId => 
      memberId.toString() !== req.user.userId.toString()
    );
    
    await group.save();

    res.status(200).json({ message: 'Successfully left group' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving group', error });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.createdBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('createdBy', 'name email profileImage')
     .populate('members', 'name email profileImage');

    res.status(200).json(updatedGroup);
  } catch (err) {
    res.status(500).json({ message: 'Error updating group', error: err.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.createdBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this group' });
    }

    await Group.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bookmark group
const bookmarkGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!user.bookmarkedGroups.includes(id)) {
      user.bookmarkedGroups.push(id);
      await user.save();
    }

    res.json({ message: 'Group bookmarked successfully' });
  } catch (error) {
    console.error('Bookmark group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Unbookmark group
const unbookmarkGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.bookmarkedGroups = user.bookmarkedGroups.filter(
      groupId => groupId.toString() !== id
    );
    await user.save();

    res.json({ message: 'Group unbookmarked successfully' });
  } catch (error) {
    console.error('Unbookmark group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  getGroupMembers,
  getUserGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup,
  bookmarkGroup,
  unbookmarkGroup
};
