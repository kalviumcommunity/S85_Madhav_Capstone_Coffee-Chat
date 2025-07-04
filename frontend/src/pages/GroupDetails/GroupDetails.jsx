import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import Chat from '../../Components/Chat/Chat';
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
  Trash2,
  Unlock,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import './GroupDetails.css';
import { Link } from 'react-router-dom';

const GroupDetails = ({ user, setUser, onBookmarkSync, setGroups }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [members, setMembers] = useState([]);
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

  const handleLeaveGroupFromChat = () => {
    setIsMember(false);
    toast.success('Left the group successfully');
    fetchGroupDetails(); // Refresh group data
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: group?.name,
          text: group?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success('Group link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please log in to bookmark groups');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups/${group._id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(prev => ({
          ...prev,
          isBookmarked: data.isBookmarked
        }));
        if (typeof onBookmarkSync === 'function') {
          onBookmarkSync(group._id, data.isBookmarked);
        }
        if (setGroups) {
          setGroups(prevGroups => prevGroups.map(g =>
            g._id === group._id ? { ...g, isBookmarked: data.isBookmarked } : g
          ));
        }
        toast.success(data.isBookmarked ? 'Group bookmarked!' : 'Group removed from bookmarks');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="animate-pulse">
            <div className="bg-secondary-200 dark:bg-secondary-700 h-8 rounded w-1/3 mb-4"></div>
            <div className="bg-secondary-200 dark:bg-secondary-700 h-64 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="bg-secondary-200 dark:bg-secondary-700 h-4 rounded w-3/4"></div>
              <div className="bg-secondary-200 dark:bg-secondary-700 h-4 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <Navbar user={user} setUser={setUser} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 text-center">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Group not found
          </h1>
          <Link to="/groups" className="btn-primary">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  const memberCount = group.memberCount || group.members?.length || 0;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Navbar user={user} setUser={setUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/groups')}
              className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
                {group.name}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium shadow-sm">
                  {group.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm ${
                  group.privacy === 'Public' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {group.privacy === 'Public' ? '🔓 Public' : '🔒 Private'}
                </span>
                {isMember && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium shadow-sm border border-green-200">
                    ✅ You're a Member
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Bookmark and Share buttons */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${
                group.isBookmarked 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-white/90 text-gray-600 hover:text-orange-600 hover:bg-white'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${group.isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/90 dark:bg-secondary-800/90 text-secondary-600 hover:text-secondary-800 dark:hover:text-white shadow-lg transition-all duration-200"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            {isCreator && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-danger flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Group Image */}
            <div className="card p-0 overflow-hidden">
              <img
                src={group.image}
                alt={group.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop';
                }}
              />
            </div>

            {/* Tabs */}
            <div className="card">
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 border-b border-secondary-200 dark:border-secondary-700">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'about'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'members'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
                  }`}
                >
                  Members ({memberCount})
                </button>
                {isMember && (
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'chat'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
                    }`}
                  >
                    Chat
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                        About This Group
                      </h2>
                      <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                        {group.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-primary-600" />
                          <div>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">Location</p>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {group.city}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-primary-600" />
                          <div>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">Members</p>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {memberCount} people
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-primary-600" />
                          <div>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">Created</p>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {new Date(group.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {group.privacy === 'Public' ? (
                              <Unlock className="w-5 h-5 text-green-600" />
                            ) : (
                              <Lock className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">Privacy</p>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {group.privacy}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'members' && (
                  <div>
                    <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                      Group Members
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {members.map(member => (
                        <div key={member._id} className="flex items-center space-x-3 p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                          <img
                            src={member.profileImage || 'https://via.placeholder.com/40x40'}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-secondary-900 dark:text-white text-sm">
                              {member.name}
                            </p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">
                              {member._id === group.createdBy._id ? 'Organizer' : 'Member'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'chat' && (isMember || isCreator) && (
                  <div>
                    <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                      Group Chat
                    </h2>
                    <div className="h-96">
                      <Chat 
                        chatType="group"
                        chatId={id}
                        chatName={group.name}
                        currentUser={user}
                        groupImage={group.image}
                        onLeaveGroup={handleLeaveGroupFromChat}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Join/Leave Section */}
              {!isCreator && (
                <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                    Join This Group
                  </h3>
                  
                  {/* Current Status Display */}
                  <div className="mb-6">
                    {isMember ? (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">You're a member!</p>
                          <p className="text-sm text-green-600 dark:text-green-300">You can participate in discussions</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg border border-secondary-200 dark:border-secondary-600">
                        <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-600 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-secondary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-800 dark:text-secondary-200">Not a member yet</p>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">Join to participate in discussions</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Join/Leave Button */}
                  <div className="space-y-3">
                    {!isMember ? (
                      <button
                        onClick={handleJoinGroup}
                        className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        Join Group
                      </button>
                    ) : (
                      <button
                        onClick={handleLeaveGroup}
                        className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        Leave Group
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Group Stats */}
              <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Group Stats
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 dark:text-secondary-400">Members</span>
                    <span className="font-semibold text-secondary-900 dark:text-white">
                      {memberCount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 dark:text-secondary-400">Privacy</span>
                    <span className="font-semibold text-secondary-900 dark:text-white">
                      {group.privacy}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 dark:text-secondary-400">Category</span>
                    <span className="font-semibold text-secondary-900 dark:text-white">
                      {group.category}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 dark:text-secondary-400">Location</span>
                    <span className="font-semibold text-secondary-900 dark:text-white">
                      {group.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Organized by
                </h3>
                
                <div className="flex items-center space-x-3">
                  <img
                    src={group.createdBy.profileImage || 'https://via.placeholder.com/48x48'}
                    alt={group.createdBy.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-secondary-900 dark:text-white">
                      {group.createdBy.name}
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Group Organizer
                    </p>
                  </div>
                </div>
              </div>
            </div>
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