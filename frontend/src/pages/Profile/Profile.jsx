import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Settings,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { FiCamera, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import BACKEND_URL from '../../config';

const INTERESTS = ["Food", "Tech", "Web Dev"];
const EMPTY_STATES = {
  groups: {
    icon: Users,
    message: "Looks like you haven't joined any groups yet.",
    cta: { to: "/groups", label: "Discover Groups" }
  },
  events: {
    icon: Calendar,
    message: "Looks like you haven't joined any events yet.",
    cta: { to: "/events", label: "Discover Events" }
  },
  bookmarks: {
    icon: Bookmark,
    message: "You haven't bookmarked anything yet.",
    cta: { to: "/events", label: "Discover Events" }
  }
};

const Profile = ({ user, setUser, setLoading = () => {} }) => {
  console.log('Profile props:', { user, setUser, setLoading });
  const [isEditing, setIsEditing] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [bookmarkedGroups, setBookmarkedGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('groups');
  const [localLoading, setLocalLoading] = useState(false); // Local loading state for actions
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchUserGroups(),
      fetchUserEvents(),
      fetchBookmarks()
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []); // Only run once on mount

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
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

  const fetchUserGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/groups/user/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const groups = await response.json();
        setUserGroups(groups);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/events/user/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const events = await response.json();
        setUserEvents(events);
      }
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBookmarkedEvents(data.events || []);
        setBookmarkedGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleSave = async () => {
    setLocalLoading(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
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
      setLocalLoading(false);
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      uploadProfileImage(file)
        .then(() => {
          toast.success('Profile image updated!');
        })
        .catch(() => {
          toast.error('Failed to upload image');
        })
        .finally(() => setUploading(false));
    }
  };

  const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ ...user, profileImage: data.profileImage });
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const tabs = [
    { id: 'groups', label: 'My Groups', icon: Users },
    { id: 'events', label: 'My Events', icon: Calendar },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark }
  ];

  if (!user) {
    console.log('Profile: user is', user, 'showing spinner or redirecting');
    // If not loading, redirect to login
    if (typeof setLoading === 'function' && setLoading.name !== 'noop' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
      return null;
    }
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

  console.log('Rendering profile content for user:', user);

  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(to bottom right, #fffaf3, #fef6f1)' }}>
      <Navbar user={user} setUser={setUser} />
      <div className="w-full max-w-5xl mx-auto mt-6 px-2 relative">
        {/* Optional: Watermark Icon */}
        <div className="hidden md:block pointer-events-none select-none fixed bottom-0 right-0 z-0 opacity-10" style={{fontSize: '10rem', lineHeight: 1}}>
          <Users className="w-40 h-40 text-orange-200" />
        </div>
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 w-full relative z-10">
          {/* Profile Image - Square with overlay */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden relative flex-shrink-0">
            <img src={preview || user.profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png'} className="w-full h-full object-cover" alt={user.name} />
            <label htmlFor="imageUpload" className="absolute bottom-1 right-1 p-1 bg-white rounded-full shadow cursor-pointer border border-orange-200">
              <Camera className="text-orange-500 w-4 h-4" />
              <input id="imageUpload" type="file" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          {/* Profile Info */}
          <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {isEditing ? (
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                    <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={3} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleSave} disabled={localLoading} className="bg-orange-500 text-white rounded-full px-4 py-2 flex items-center gap-2 hover:bg-orange-600 transition">
                      {localLoading ? <FiLoader className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} Save
                    </button>
                    <button
                      onClick={() => {
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          location: user.location || '',
                          bio: user.bio || ''
                        });
                        setIsEditing(false);
                      }}
                      className="bg-gray-100 text-gray-600 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-gray-200 transition"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">{user.name}
                    <span className="ml-2 bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full text-xs font-semibold">Member for {Math.max(1, Math.floor((Date.now() - new Date(user.createdAt)) / (1000*60*60*24)))} days</span>
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2 mt-1"><Mail className="w-4 h-4" /> {user.email}</p>
                  {user.location && <p className="text-gray-600 flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {user.location}</p>}
                  <p className="text-gray-600 flex items-center gap-2 mt-1"><Calendar className="w-4 h-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                  {user.bio && <p className="text-gray-700 mt-2">{user.bio}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INTERESTS.map((interest) => (
                      <span key={interest} className="bg-orange-50 text-orange-500 px-3 py-1 rounded-full text-xs font-medium">{interest}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-row gap-2 sm:flex-col sm:gap-2 items-center">
              <button
                onClick={() => {
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    location: user.location || '',
                    bio: user.bio || ''
                  });
                  setIsEditing(true);
                }}
                className="bg-orange-50 text-orange-500 rounded-full p-2 shadow hover:bg-orange-100 transition"
              >
                <Edit className="w-4 h-4" />
              </button>
              <Link to="/settings" className="bg-orange-50 text-orange-500 rounded-full p-2 shadow hover:bg-orange-100 transition"><Settings className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 max-w-4xl mx-auto text-center">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-2xl font-bold text-orange-500">{userGroups.length}</p>
            <p className="text-sm text-gray-600">Groups</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-2xl font-bold text-orange-500">{userEvents.length}</p>
            <p className="text-sm text-gray-600">Events</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-2xl font-bold text-orange-500">{bookmarkedEvents.length + bookmarkedGroups.length}</p>
            <p className="text-sm text-gray-600">Bookmarks</p>
          </div>
        </div>
        {/* Tabs - sticky, scrollable, premium style */}
        <div className="flex space-x-6 p-4 rounded-xl bg-white shadow-sm sticky top-20 z-10 overflow-x-auto whitespace-nowrap mt-8 mb-4 backdrop-blur-sm">
          <button onClick={() => setActiveTab('groups')} className={`flex items-center gap-2 ${activeTab === 'groups' ? 'border-b-2 border-orange-500 font-bold text-orange-600' : 'text-gray-500'} pb-2`}><Users className="w-4 h-4" /> My Groups</button>
          <button onClick={() => setActiveTab('events')} className={`flex items-center gap-2 ${activeTab === 'events' ? 'border-b-2 border-orange-500 font-bold text-orange-600' : 'text-gray-500'} pb-2`}><Calendar className="w-4 h-4" /> My Events</button>
          <button onClick={() => setActiveTab('bookmarks')} className={`flex items-center gap-2 ${activeTab === 'bookmarks' ? 'border-b-2 border-orange-500 font-bold text-orange-600' : 'text-gray-500'} pb-2`}><Bookmark className="w-4 h-4" /> Bookmarks</button>
        </div>
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'groups' && (
            <motion.div key="groups" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }}>
              {userGroups.length === 0 ? (
                <div className="text-center text-gray-500 flex flex-col items-center justify-center py-10">
                  <Users className="w-10 h-10 text-gray-300 mb-2" />
                  <p>You haven't joined any groups yet.</p>
                  <Link to="/groups" className="mt-4 bg-orange-500 text-white rounded-full px-4 py-2 hover:bg-orange-600">Discover Groups</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                  {userGroups.map(group => (
                    <div key={group._id} className="bg-white rounded-xl shadow hover:scale-[1.02] transition-transform">
                      <img src={group.image || 'https://via.placeholder.com/300x200'} className="h-40 w-full object-cover rounded-t-xl" alt={group.name} />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.city}</p>
                        <Link to={`/groups/${group._id}`}><button className="mt-2 text-orange-500 border border-orange-500 rounded-full px-4 py-1 hover:bg-orange-50">View Group</button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'events' && (
            <motion.div key="events" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }}>
              {userEvents.length === 0 ? (
                <div className="text-center text-gray-500 flex flex-col items-center justify-center py-10">
                  <Calendar className="w-10 h-10 text-gray-300 mb-2" />
                  <p>You haven't joined any events yet.</p>
                  <Link to="/events" className="mt-4 bg-orange-500 text-white rounded-full px-4 py-2 hover:bg-orange-600">Discover Events</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                  {userEvents.map(event => (
                    <div key={event._id} className="bg-white rounded-xl shadow hover:scale-[1.02] transition-transform">
                      <img src={event.image || 'https://via.placeholder.com/300x200'} className="h-40 w-full object-cover rounded-t-xl" alt={event.name} />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{event.name}</h3>
                        <p className="text-sm text-gray-500">{event.city}</p>
                        <Link to={`/events/${event._id}`}><button className="mt-2 text-orange-500 border border-orange-500 rounded-full px-4 py-1 hover:bg-orange-50">View Event</button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'bookmarks' && (
            <motion.div key="bookmarks" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }}>
              {bookmarkedEvents.length === 0 && bookmarkedGroups.length === 0 ? (
                <div className="text-center text-gray-500 flex flex-col items-center justify-center py-10">
                  <Bookmark className="w-10 h-10 text-gray-300 mb-2" />
                  <p>You haven't bookmarked any events or groups yet.</p>
                  <Link to="/events" className="mt-4 bg-orange-500 text-white rounded-full px-4 py-2 hover:bg-orange-600">Discover Events</Link>
                  <Link to="/groups" className="mt-4 bg-orange-500 text-white rounded-full px-4 py-2 hover:bg-orange-600 ml-2">Discover Groups</Link>
                </div>
              ) : (
                <>
                  {bookmarkedEvents.length > 0 && (
                    <>
                      <h3 className="font-semibold text-lg mb-2 mt-4">Bookmarked Events</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-2">
                        {bookmarkedEvents.map(event => (
                          <div key={event._id} className="bg-white rounded-xl shadow hover:scale-[1.02] transition-transform">
                            <img src={event.image || 'https://via.placeholder.com/300x200'} className="h-40 w-full object-cover rounded-t-xl" alt={event.name} />
                            <div className="p-4">
                              <h3 className="font-semibold text-lg">{event.name}</h3>
                              <p className="text-sm text-gray-500">{event.city}</p>
                              <Link to={`/events/${event._id}`}><button className="mt-2 text-orange-500 border border-orange-500 rounded-full px-4 py-1 hover:bg-orange-50">View Event</button></Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {bookmarkedGroups.length > 0 && (
                    <>
                      <h3 className="font-semibold text-lg mb-2 mt-8">Bookmarked Groups</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-2">
                        {bookmarkedGroups.map(group => (
                          <div key={group._id} className="bg-white rounded-xl shadow hover:scale-[1.02] transition-transform">
                            <img src={group.image || 'https://via.placeholder.com/300x200'} className="h-40 w-full object-cover rounded-t-xl" alt={group.name} />
                            <div className="p-4">
                              <h3 className="font-semibold text-lg">{group.name}</h3>
                              <p className="text-sm text-gray-500">{group.city}</p>
                              <Link to={`/groups/${group._id}`}><button className="mt-2 text-orange-500 border border-orange-500 rounded-full px-4 py-1 hover:bg-orange-50">View Group</button></Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile; 