import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Edit, 
  Trash2, 
  MessageCircle,
  UserPlus,
  UserMinus,
  Bookmark,
  Share2
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import toast from 'react-hot-toast';
import './EventDetails.css';

const EventDetails = ({ user, setUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/events/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        setEditForm({
          name: data.name,
          description: data.description,
          category: data.category,
          city: data.city,
          date: format(new Date(data.date), 'yyyy-MM-dd'),
          startTime: data.time?.start || '',
          endTime: data.time?.end || '',
          image: data.image
        });
      } else {
        toast.error('Event not found');
        navigate('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handleAttend = async () => {
    if (!user) {
      toast.error('Please log in to attend events');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Successfully joined event!');
        fetchEventDetails();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const handleLeave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Successfully left event');
        fetchEventDetails();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to leave event');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave event');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const token = localStorage.getItem('token');
      const eventDateTime = new Date(`${editForm.date}T${editForm.startTime}`);
      
      const eventData = {
        ...editForm,
        date: eventDateTime.toISOString(),
        time: {
          start: editForm.startTime,
          end: editForm.endTime
        }
      };

      const response = await fetch(`http://localhost:3000/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        toast.success('Event updated successfully!');
        setShowEditModal(false);
        fetchEventDetails();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Event deleted successfully!');
        navigate('/events');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    
    if (isBefore(eventTime, now)) {
      return { status: 'Past', color: 'text-red-600 bg-red-100' };
    } else if (isAfter(eventTime, now)) {
      return { status: 'Upcoming', color: 'text-green-600 bg-green-100' };
    } else {
      return { status: 'Ongoing', color: 'text-blue-600 bg-blue-100' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <Navbar user={user} setUser={setUser} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  if (!event) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <Navbar user={user} setUser={setUser} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Event not found
          </h1>
          <Link to="/events" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus(event.date);
  const isCreator = user && event.createdBy._id === user._id;
  const isAttending = event.isAttending;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Navbar user={user} setUser={setUser} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/events')}
              className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
                {event.name}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
                  {eventStatus.status}
                </span>
                <span className="text-secondary-600 dark:text-secondary-300">
                  by {event.createdBy.name}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
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
            
            {!isCreator && user && (
              <button
                onClick={isAttending ? handleLeave : handleAttend}
                className={`flex items-center space-x-2 ${
                  isAttending ? 'btn-outline' : 'btn-primary'
                }`}
              >
                {isAttending ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    <span>Leave</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Attend</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowChat(!showChat)}
              className="btn-outline flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="card p-0 overflow-hidden">
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop';
                }}
              />
            </div>

            {/* Event Details */}
            <div className="card">
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                About This Event
              </h2>
              <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Event Info */}
            <div className="card">
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                Event Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-secondary-900 dark:text-white font-medium">
                      {format(new Date(event.date), 'EEEE, MMMM do, yyyy')}
                    </p>
                    {event.time && (
                      <p className="text-secondary-600 dark:text-secondary-300 text-sm">
                        {event.time.start} - {event.time.end}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-secondary-400" />
                  <span className="text-secondary-700 dark:text-secondary-300">
                    {event.city}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-secondary-400" />
                  <span className="text-secondary-700 dark:text-secondary-300">
                    {event.attendeeCount || 0} attending
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Section */}
            {showChat && (
              <div className="card">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Event Chat
                </h2>
                <div className="bg-secondary-100 dark:bg-secondary-800 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Chat functionality coming soon...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendees */}
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Attendees ({event.attendeeCount || 0})
              </h3>
              <div className="space-y-3">
                {event.attendees && event.attendees.length > 0 ? (
                  event.attendees.slice(0, 5).map((attendee) => (
                    <div key={attendee._id} className="flex items-center space-x-3">
                      <img
                        src={attendee.profileImage}
                        alt={attendee.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                        }}
                      />
                      <span className="text-secondary-700 dark:text-secondary-300 text-sm">
                        {attendee.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                    No attendees yet
                  </p>
                )}
                {event.attendees && event.attendees.length > 5 && (
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                    +{event.attendees.length - 5} more
                  </p>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Event Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-secondary-600 dark:text-secondary-400">Category:</span>
                  <span className="text-secondary-900 dark:text-white ml-2">{event.category}</span>
                </div>
                <div>
                  <span className="text-secondary-600 dark:text-secondary-400">Created:</span>
                  <span className="text-secondary-900 dark:text-white ml-2">
                    {format(new Date(event.createdAt), 'MMM do, yyyy')}
                  </span>
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
              Edit Event
            </h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Event Name *
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
                    Date *
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

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
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                    className="input-field"
                    required
                  />
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
                  {editLoading ? 'Updating...' : 'Update Event'}
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
              Delete Event
            </h2>
            <p className="text-secondary-700 dark:text-secondary-300 mb-6">
              Are you sure you want to delete "{event.name}"? This action cannot be undone.
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
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails; 