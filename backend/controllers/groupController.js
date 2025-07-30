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

    // Add bookmark status if user is logged in
    if (req.user && req.user.userId) {
      const user = await User.findById(req.user.userId);
      if (user && user.bookmarkedGroups) {
        groupsWithCounts.forEach(group => {
          group.isBookmarked = user.bookmarkedGroups.includes(group._id);
        });
      }
    }

    res.status(200).json(groupsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'name email profileImage')
      .populate('members', 'name email profileImage location')
      .populate('pendingRequests.userId', 'name email profileImage');

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
      
      // Add bookmark status
      const user = await User.findById(req.user.userId);
      if (user && user.bookmarkedGroups) {
        groupObj.isBookmarked = user.bookmarkedGroups.includes(group._id);
      }
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
    const { name, description, category, city, image, privacy, enableChat, enableEvents, rules, tags } = req.body;

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
      privacy: privacy || 'public',
      chatEnabled: enableChat !== false, // Default to true if not specified
      eventCreationEnabled: enableEvents !== false, // Default to true if not specified
      rules: rules ? [rules] : [],
      tags: tags || [],
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

    // Check if user already has a pending request
    const hasPendingRequest = group.pendingRequests.some(request => 
      request.userId.toString() === req.user.userId.toString()
    );
    
    if (hasPendingRequest) {
      return res.status(400).json({ message: 'You already have a pending request to join this group' });
    }

    // Handle based on privacy setting
    if (group.privacy === 'public') {
      // Public group - add user directly to members
      group.members.push(req.user.userId);
      await group.save();
      res.status(200).json({ message: 'Successfully joined group' });
    } else if (group.privacy === 'private') {
      // Private group - add user to pending requests
      group.pendingRequests.push({
        userId: req.user.userId,
        requestedAt: new Date()
      });
      await group.save();
      res.status(200).json({ message: 'Request sent — waiting for organizer approval' });
    } else {
      res.status(400).json({ message: 'Invalid group privacy setting' });
    }
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

// Bookmark/Unbookmark group
const bookmarkGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize bookmarkedGroups array if it doesn't exist
    if (!user.bookmarkedGroups) {
      user.bookmarkedGroups = [];
    }

    const isBookmarked = user.bookmarkedGroups.includes(group._id);
    
    if (isBookmarked) {
      // Remove from bookmarks
      user.bookmarkedGroups = user.bookmarkedGroups.filter(
        groupId => groupId.toString() !== group._id.toString()
      );
    } else {
      // Add to bookmarks
      user.bookmarkedGroups.push(group._id);
    }

    await user.save();

    res.status(200).json({ 
      message: isBookmarked ? 'Group removed from bookmarks' : 'Group bookmarked successfully',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error('Error bookmarking group:', error);
    res.status(500).json({ message: 'Error bookmarking group', error: error.message });
  }
};

// Approve a pending request to join a group
const approveRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the organizer (createdBy)
    if (group.createdBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Only the group organizer can approve requests' });
    }

    const requestUserId = req.params.userId;
    
    // Find the pending request
    const pendingRequest = group.pendingRequests.find(request => 
      request.userId.toString() === requestUserId
    );

    if (!pendingRequest) {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    // Add user to members
    group.members.push(requestUserId);
    
    // Remove from pending requests
    group.pendingRequests = group.pendingRequests.filter(request => 
      request.userId.toString() !== requestUserId
    );

    await group.save();

    res.status(200).json({ message: 'Request approved successfully' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Error approving request', error: error.message });
  }
};

// Reject a pending request to join a group
const rejectRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the organizer (createdBy)
    if (group.createdBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Only the group organizer can reject requests' });
    }

    const requestUserId = req.params.userId;
    
    // Find the pending request
    const pendingRequest = group.pendingRequests.find(request => 
      request.userId.toString() === requestUserId
    );

    if (!pendingRequest) {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    // Remove from pending requests
    group.pendingRequests = group.pendingRequests.filter(request => 
      request.userId.toString() !== requestUserId
    );

    await group.save();

    res.status(200).json({ message: 'Request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
};

// Withdraw a pending request to join a group
const withdrawRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const requestUserId = req.user.userId;
    
    // Find the pending request
    const pendingRequest = group.pendingRequests.find(request => 
      request.userId.toString() === requestUserId
    );

    if (!pendingRequest) {
      return res.status(404).json({ message: 'No pending request found for this user' });
    }

    // Remove from pending requests
    group.pendingRequests = group.pendingRequests.filter(request => 
      request.userId.toString() !== requestUserId
    );

    await group.save();

    res.status(200).json({ message: 'Request withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing request:', error);
    res.status(500).json({ message: 'Error withdrawing request', error: error.message });
  }
};

// Get pending requests for a group
const getPendingRequests = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('pendingRequests.userId', 'name email profileImage')
      .populate('createdBy', 'name email profileImage');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the organizer (createdBy)
    if (group.createdBy._id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Only the group organizer can view pending requests' });
    }

    res.status(200).json(group.pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
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
  approveRequest,
  rejectRequest,
  withdrawRequest,
  getPendingRequests
};
