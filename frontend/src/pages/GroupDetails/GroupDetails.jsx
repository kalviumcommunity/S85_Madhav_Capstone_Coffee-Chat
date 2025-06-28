import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { 
  MapPin, 
  Users, 
  Calendar, 
  MessageCircle, 
  Bookmark,
  Share2,
  Settings,
  Plus,
  Send,
  Heart,
  MoreHorizontal,
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import './GroupDetails.css';

const GroupDetails = ({ user, setUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/groups/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const groupData = await response.json();
        setGroup(groupData);
        setIsMember(groupData.isMember || groupData.members.some(member => member._id === user?._id));
        setIsCreator(groupData.createdBy._id === user?._id);
        setMembers(groupData.members);
        
        // Set edit form data
        setEditForm({
          name: groupData.name,
          description: groupData.description,
          category: groupData.category,
          city: groupData.city,
          image: groupData.image,
          privacy: groupData.privacy
        });
      } else {
        toast.error('Group not found');
        navigate('/groups');
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast.error('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/groups/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsMember(true);
        toast.success('Successfully joined the group!');
        fetchGroupDetails(); // Refresh group data
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/groups/${id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsMember(false);
        toast.success('Left the group successfully');
        fetchGroupDetails(); // Refresh group data
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast.success('Group updated successfully!');
        setShowEditModal(false);
        fetchGroupDetails();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/groups/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Group deleted successfully!');
        navigate('/groups');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/chat/groups/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          type: 'text'
        })
      });

      if (response.ok) {
        const messageData = await response.json();
        setMessages([...messages, messageData]);
        setNewMessage('');
        toast.success('Message sent!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/groups/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Group bookmarked!');
      } else {
        toast.error('Failed to bookmark group');
      }
    } catch (error) {
      console.error('Error bookmarking group:', error);
      toast.error('Failed to bookmark group');
    }
  };

  const tabs = [
    { id: 'about', label: 'About', icon: null },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <Navbar user={user} setUser={setUser} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600 dark:text-secondary-300">Loading group details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <Navbar user={user} setUser={setUser} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-secondary-600 dark:text-secondary-300">Group not found</p>
            <button
              onClick={() => navigate('/groups')}
              className="btn-primary mt-4"
            >
              Back to Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Navbar user={user} setUser={setUser} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/groups')}
          className="flex items-center space-x-2 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </button>

        {/* Group Header */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Group Image */}
            <div className="lg:w-1/3">
              <img
                src={group.image || 'https://via.placeholder.com/400x300'}
                alt={group.name}
                className="w-full h-64 lg:h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300';
                }}
              />
            </div>

            {/* Group Info */}
            <div className="lg:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
                    {group.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-secondary-600 dark:text-secondary-300 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{group.city}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{members.length} members</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isCreator && (
                    <>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="p-2 text-secondary-400 hover:text-primary-600 transition-colors duration-200"
                        title="Edit Group"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-2 text-secondary-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete Group"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleBookmark}
                    className="p-2 text-secondary-400 hover:text-primary-600 transition-colors duration-200"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-secondary-400 hover:text-primary-600 transition-colors duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-secondary-700 dark:text-secondary-300 mb-6">
                {group.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {group.category}
                </span>
                <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium capitalize">
                  {group.privacy}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!isMember ? (
                  <button
                    onClick={handleJoinGroup}
                    className="btn-primary flex items-center justify-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Join Group</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveGroup}
                    className="btn-outline flex items-center justify-center space-x-2"
                  >
                    <span>Leave Group</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-secondary-200 dark:border-secondary-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3">
                    About this group
                  </h3>
                  <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
                    {group.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">
                      Group Details
                    </h4>
                    <div className="space-y-2 text-sm text-secondary-600 dark:text-secondary-300">
                      <div className="flex justify-between">
                        <span>Privacy:</span>
                        <span className="capitalize">{group.privacy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Creator:</span>
                        <span>{group.createdBy.name}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">
                      Location
                    </h4>
                    <div className="space-y-2 text-sm text-secondary-600 dark:text-secondary-300">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{group.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-6">
                  Group Members ({members.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <div key={member._id} className="card flex items-center space-x-3">
                      <img
                        src={member.profileImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary-900 dark:text-white">
                          {member.name}
                        </h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300">
                          {member.location || 'No location'}
                        </p>
                      </div>
                      {member._id === group.createdBy._id && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          Creator
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="h-96 flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                      <p className="text-secondary-600 dark:text-secondary-300">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender._id === user?._id
                              ? 'bg-primary-600 text-white'
                              : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-900 dark:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">
                              {message.sender.name}
                            </span>
                            <span className="text-xs opacity-75">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 input-field"
                    disabled={!isMember}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!isMember || sendingMessage || !newMessage.trim()}
                    className="btn-primary px-4"
                  >
                    {sendingMessage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
              Edit Group
            </h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="input-field"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="Technology">Technology</option>
                    <option value="Sports">Sports</option>
                    <option value="Music">Music</option>
                    <option value="Art">Art</option>
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Privacy
                  </label>
                  <select
                    value={editForm.privacy}
                    onChange={(e) => setEditForm({...editForm, privacy: e.target.value})}
                    className="input-field"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={editForm.image}
                  onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 btn-primary"
                >
                  {editLoading ? 'Updating...' : 'Update Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
              Delete Group
            </h2>
            <p className="text-secondary-700 dark:text-secondary-300 mb-6">
              Are you sure you want to delete "{group.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 btn-danger"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails; 