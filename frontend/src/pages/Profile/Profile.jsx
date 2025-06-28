import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { 
  Edit, 
  Save, 
  X, 
  MapPin, 
  Mail, 
  Calendar, 
  Users, 
  Bookmark,
  Camera,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('groups');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ ...user, profileImage: data.profileImage });
        toast.success('Profile image updated!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const tabs = [
    { id: 'groups', label: 'My Groups', icon: Users },
    { id: 'events', label: 'My Events', icon: Calendar },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <Navbar user={user} setUser={setUser} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600 dark:text-secondary-300">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Navbar user={user} setUser={setUser} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={user.profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png'}
                alt={user.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-secondary-700 shadow-lg"
              />
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors duration-200">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="input-field"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {user.name}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-secondary-400 hover:text-primary-600 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-secondary-600 dark:text-secondary-300">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.bio && (
                      <p className="mt-3 text-secondary-700 dark:text-secondary-300">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
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
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'groups' && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Groups You've Joined
                </h3>
                {userGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-600 dark:text-secondary-300 mb-4">
                      You haven't joined any groups yet
                    </p>
                    <button
                      onClick={() => navigate('/groups')}
                      className="btn-primary"
                    >
                      Discover Groups
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userGroups.map((group) => (
                      <div key={group._id} className="card-hover">
                        <img
                          src={group.image || 'https://via.placeholder.com/300x200'}
                          alt={group.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">
                          {group.name}
                        </h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-2">
                          {group.city}
                        </p>
                        <button
                          onClick={() => navigate(`/groups/${group._id}`)}
                          className="btn-outline w-full"
                        >
                          View Group
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Events You're Attending
                </h3>
                {userEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-600 dark:text-secondary-300 mb-4">
                      You're not attending any events yet
                    </p>
                    <button
                      onClick={() => navigate('/events')}
                      className="btn-primary"
                    >
                      Discover Events
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userEvents.map((event) => (
                      <div key={event._id} className="card-hover">
                        <img
                          src={event.image || 'https://via.placeholder.com/300x200'}
                          alt={event.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">
                          {event.name}
                        </h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-2">
                          {new Date(event.date).toLocaleDateString()} • {event.city}
                        </p>
                        <button
                          onClick={() => navigate(`/events/${event._id}`)}
                          className="btn-outline w-full"
                        >
                          View Event
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Bookmarked Events
                </h3>
                {bookmarkedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-600 dark:text-secondary-300 mb-4">
                      You haven't bookmarked any events yet
                    </p>
                    <button
                      onClick={() => navigate('/events')}
                      className="btn-primary"
                    >
                      Discover Events
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookmarkedEvents.map((event) => (
                      <div key={event._id} className="card-hover">
                        <img
                          src={event.image || 'https://via.placeholder.com/300x200'}
                          alt={event.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">
                          {event.name}
                        </h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-2">
                          {new Date(event.date).toLocaleDateString()} • {event.city}
                        </p>
                        <button
                          onClick={() => navigate(`/events/${event._id}`)}
                          className="btn-outline w-full"
                        >
                          View Event
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 