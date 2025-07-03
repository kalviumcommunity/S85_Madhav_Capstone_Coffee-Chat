import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import Chat from '../../Components/Chat/Chat';
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
  Share2,
  CheckCircle,
  HelpCircle,
  XCircle,
  User
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
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    date: '',
    image: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        setIsMember(eventData.isMember || eventData.members?.some(member => member._id === user?._id));
        setIsCreator(eventData.createdBy._id === user?._id);
        setMembers(eventData.members);
        
        // Set edit form data with proper date formatting
        const eventDate = new Date(eventData.date);
        const formattedDate = eventDate.toISOString().slice(0, 16); // Format for datetime-local input
        
        setEditForm({
          name: eventData.name,
          description: eventData.description,
          category: eventData.category,
          city: eventData.city,
          date: formattedDate,
          image: eventData.image
        });
      } else {
        toast.error('Event not found');
        navigate('/events');
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
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

  const handleRSVP = async (eventId, rsvpType) => {
    if (!user) {
      toast.error('Please log in to RSVP to events');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rsvpType })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || `Successfully marked as ${rsvpType}!`);
        
        // Update the local state immediately for instant UI feedback
        setEvent(prevEvent => {
          if (!prevEvent) return prevEvent;
          
          const updatedEvent = { ...prevEvent };
          
          // Update the RSVP status based on the response
          if (rsvpType === 'attending') {
            updatedEvent.isAttending = !prevEvent.isAttending;
            if (updatedEvent.isAttending) {
              updatedEvent.isInterested = false;
              updatedEvent.isNotAttending = false;
            }
          } else if (rsvpType === 'interested') {
            updatedEvent.isInterested = !prevEvent.isInterested;
            if (updatedEvent.isInterested) {
              updatedEvent.isAttending = false;
              updatedEvent.isNotAttending = false;
            }
          } else if (rsvpType === 'not-attending') {
            updatedEvent.isNotAttending = true;
            updatedEvent.isAttending = false;
            updatedEvent.isInterested = false;
          } else if (rsvpType === 'not-interested') {
            updatedEvent.isInterested = false;
          }
          
          return updatedEvent;
        });
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to RSVP');
      }
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      toast.error('Failed to RSVP');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
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

  // Helper to get RSVP status
  const getRSVPStatus = () => {
    if (event?.isAttending) return 'attending';
    if (event?.isOnWaitlist) return 'waitlist';
    if (event?.isInterested) return 'interested';
    if (event?.isNotAttending) return 'not-attending';
    return 'not-rsvped';
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.name,
          text: event?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success('Event link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please log in to bookmark events');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event._id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvent(prev => ({
          ...prev,
          isBookmarked: data.isBookmarked
        }));
        toast.success(data.isBookmarked ? 'Event bookmarked!' : 'Event removed from bookmarks');
      } else {
        toast.error('Failed to bookmark event');
      }
    } catch (error) {
      console.error('Error bookmarking event:', error);
      toast.error('Failed to bookmark event');
    }
  };

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

  if (!event) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <Navbar user={user} setUser={setUser} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 text-center">
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
  const rsvpStatus = getRSVPStatus();
  const attendeeCount = event.attendeeCount || event.attendees?.length || 0;
  const interestedCount = event.interestedCount || event.interested?.length || 0;
  const waitlistCount = event.waitlistCount || event.waitlist?.length || 0;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Navbar user={user} setUser={setUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
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
                {/* RSVP Status Badge */}
                {rsvpStatus === 'attending' && (
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                    ✅ You're In
                  </span>
                )}
                {rsvpStatus === 'interested' && (
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
                    🤔 Interested
                  </span>
                )}
                {rsvpStatus === 'waitlist' && (
                  <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium border border-yellow-200">
                    ⏳ Waitlist
                  </span>
                )}
                {rsvpStatus === 'not-attending' && (
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium border border-red-200">
                    👤 Not RSVPed
                  </span>
                )}
                {rsvpStatus === 'not-rsvped' && (
                  <span className="px-2 py-1 rounded-full bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300 text-xs font-medium border border-secondary-200 dark:border-secondary-600">
                    👤 Not RSVPed
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
              className={`p-2 rounded-full transition-all duration-200 ${
                event.isBookmarked 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'bg-white/90 dark:bg-secondary-800/90 text-secondary-600 hover:text-primary-600 shadow-lg'
              }`}
            >
              <Bookmark className="w-5 h-5" />
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
          {/* Main Content - Left Column (70%) */}
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
              <h2 className="text-2xl font-semibold text-secondary-900 dark:text-white mb-4">
                About This Event
              </h2>
              <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
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
                  <div className="flex items-center space-x-4">
                    <span className="text-secondary-700 dark:text-secondary-300">
                      {attendeeCount} people RSVPed
                    </span>
                    {interestedCount > 0 && (
                      <span className="text-blue-600 dark:text-blue-400 text-sm">
                        {interestedCount} interested
                      </span>
                    )}
                    {waitlistCount > 0 && (
                      <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                        {waitlistCount} on waitlist
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Who's Attending Section */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Who's Attending ({attendeeCount})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.attendees.slice(0, 6).map((attendee) => (
                    <div key={attendee._id} className="flex items-center space-x-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                      <img
                        src={attendee.profileImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                        alt={attendee.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary-900 dark:text-white">
                          {attendee.name}
                        </h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300">
                          {attendee.location || 'No location'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {event.attendees.length > 6 && (
                    <div className="flex items-center justify-center p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                      <span className="text-sm text-secondary-600 dark:text-secondary-300">
                        + {event.attendees.length - 6} more
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat Section */}
            {showChat && (
              <div className="card">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Event Chat
                </h2>
                <div className="h-96">
                  {user && (rsvpStatus === 'attending' || rsvpStatus === 'interested' || rsvpStatus === 'waitlist' || isCreator) ? (
                    <Chat 
                      chatType="event"
                      chatId={id}
                      chatName={event.name}
                      currentUser={user}
                      eventImage={event.image}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                        <p className="text-secondary-600 dark:text-secondary-300 mb-4">
                          Join the event to participate in the chat
                        </p>
                        <button
                          onClick={handleAttend}
                          className="btn-primary"
                        >
                          Join Event
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar - Right Column (30%) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* RSVP Section */}
              {!isCreator && user && eventStatus.status !== 'Past' && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                    RSVP to This Event
                  </h3>
                  
                  {/* Current RSVP Status */}
                  <div className="mb-6 p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        Your Status:
                      </span>
                      <div className="flex items-center gap-2">
                        {rsvpStatus === 'attending' && (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium border border-green-200">
                            ✅ You're Going
                          </span>
                        )}
                        {rsvpStatus === 'interested' && (
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium border border-blue-200">
                            🤔 Interested
                          </span>
                        )}
                        {rsvpStatus === 'waitlist' && (
                          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium border border-yellow-200">
                            ⏳ On Waitlist
                          </span>
                        )}
                        {rsvpStatus === 'not-attending' && (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium border border-red-200">
                            👤 Not RSVPed
                          </span>
                        )}
                        {rsvpStatus === 'not-rsvped' && (
                          <span className="px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300 text-sm font-medium border border-secondary-200 dark:border-secondary-600">
                            👤 Not RSVPed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RSVP Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleRSVP(event._id, rsvpStatus === 'attending' ? 'not-attending' : 'attending')}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        rsvpStatus === 'attending' 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {rsvpStatus === 'attending' ? (
                        <>
                          <UserMinus className="w-4 h-4 inline mr-2" />
                          Not Attend
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 inline mr-2" />
                          Attend
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleRSVP(event._id, rsvpStatus === 'interested' ? 'not-interested' : 'interested')}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        rsvpStatus === 'interested' 
                          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                          : 'bg-secondary-100 hover:bg-secondary-200 text-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-600 dark:text-secondary-300'
                      }`}
                    >
                      {rsvpStatus === 'interested' ? 'Not Interested' : 'Interested'}
                    </button>

                    {/* Waitlist Notice */}
                    {event.maxAttendees > 0 && attendeeCount >= event.maxAttendees && rsvpStatus !== 'attending' && rsvpStatus !== 'waitlist' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-yellow-600 text-lg">⏳</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800">
                              Event is full
                            </h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              This event has reached its maximum capacity of {event.maxAttendees} attendees.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Stats */}
              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Event Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 dark:text-secondary-300">Attendees</span>
                    <span className="font-semibold text-secondary-900 dark:text-white">{attendeeCount}</span>
                  </div>
                  {interestedCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-600 dark:text-secondary-300">Interested</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{interestedCount}</span>
                    </div>
                  )}
                  {waitlistCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-600 dark:text-secondary-300">Waitlist</span>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">{waitlistCount}</span>
                    </div>
                  )}
                  {event.maxAttendees > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-600 dark:text-secondary-300">Capacity</span>
                      <span className="font-semibold text-secondary-900 dark:text-white">{event.maxAttendees}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="w-full btn-outline"
                  >
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    {showChat ? 'Hide Chat' : 'Show Chat'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
              Edit Event
            </h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Name
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
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="input-field"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Category</option>
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
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  City
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
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editForm.date}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={editForm.image}
                  onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 btn-primary"
                >
                  {editLoading ? 'Updating...' : 'Update Event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
              Delete Event
            </h2>
            <p className="text-secondary-600 dark:text-secondary-300 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 btn-danger"
              >
                Delete Event
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails; 