import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Plus, 
  Grid, 
  List,
  Calendar,
  Clock,
  Star,
  Bookmark,
  Share2,
  ArrowRight,
  Heart,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import alexander from '../../assets/events/alexander-ward-MXv-9PlMyzw-unsplash.jpg';
import anthony from '../../assets/events/anthony-delanoix-hzgs56Ze49s-unsplash.jpg';
import ashley from '../../assets/events/ashley-edwards-V9YOjHqEWww-unsplash.jpg';
import kaleb from '../../assets/events/kaleb-nimz--5rA4DRrEXU-unsplash.jpg';
import lukas from '../../assets/events/lukas-eggers-tcx3xQgqU-k-unsplash.jpg';
import teddy from '../../assets/events/pexels-teddy-2263436.jpg';
import wendy from '../../assets/events/pexels-wendywei-1190297.jpg';
// Ensure the Events page CSS is loaded for carousel animation
import './Events.css';

const EVENT_IMAGES = [alexander, anthony, ashley, kaleb, lukas, teddy, wendy];

function HorizontalCarousel() {
  const images = EVENT_IMAGES;
  const visibleCount = 3;
  const imageWidth = 300;
  const gap = 40;
  // Duplicate the image set for seamless looping
  const allImages = [...images, ...images];

  return (
    <div className="carousel-wrapper" style={{
      overflow: 'hidden',
      width: imageWidth * visibleCount + gap * (visibleCount - 1),
      maxWidth: '100%',
      height: 260,
      position: 'relative',
      borderRadius: '2rem',
      background: 'rgba(255,255,255,0.10)',
      boxShadow: '0 12px 40px rgba(255, 171, 54, 0.10), 0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div
        className="carousel-track"
        style={{
          display: 'flex',
          width: 'fit-content',
        }}
      >
        {allImages.map((img, i) => (
          <img
            key={i + '-' + img}
            src={img}
            alt={`Event ${i+1}`}
            style={{
              width: imageWidth,
              height: 260,
              marginRight: gap,
              borderRadius: '1.5rem',
              objectFit: 'cover',
              boxShadow: '0 6px 18px rgba(0,0,0,0.10)',
              background: '#FFF0E0',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const Events = ({ user, setUser }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');

  const categories = [
    'All', 'Technology', 'Sports', 'Music', 'Art', 'Food', 'Travel', 'Business', 'Education', 'Health', 'Social', 'Other'
  ];

  const cities = ['All', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

  const dateFilters = [
    { value: 'All', label: 'All Events' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past Events' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchQuery, selectedCategory, selectedCity, selectedDate, sortBy]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEvents = () => {
    let filtered = [...events];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by city
    if (selectedCity !== 'All') {
      filtered = filtered.filter(event => event.city === selectedCity);
    }

    // Filter by date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    switch (selectedDate) {
      case 'today':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate < tomorrow;
        });
        break;
      case 'tomorrow':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= tomorrow && eventDate < addDays(tomorrow, 1);
        });
        break;
      case 'this-week':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate < nextWeek;
        });
        break;
      case 'this-month':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate < nextMonth;
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        });
        break;
      case 'past':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate < today;
        });
        break;
    }

    // Sort events
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.attendeeCount || b.attendees?.length || 0) - (a.attendeeCount || a.attendees?.length || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
    }

    setFilteredEvents(filtered);
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
        setEvents(prevEvents => 
          prevEvents.map(event => {
            if (event._id === eventId) {
              const updatedEvent = { ...event };
              
              // Update the RSVP status based on the response
              if (rsvpType === 'attending') {
                updatedEvent.isAttending = !event.isAttending;
                if (updatedEvent.isAttending) {
                  updatedEvent.isInterested = false;
                  updatedEvent.isNotAttending = false;
                }
              } else if (rsvpType === 'interested') {
                updatedEvent.isInterested = !event.isInterested;
                if (updatedEvent.isInterested) {
                  updatedEvent.isAttending = false;
                  updatedEvent.isNotAttending = false;
                }
              } else if (rsvpType === 'not-attending') {
                updatedEvent.isNotAttending = true;
                updatedEvent.isAttending = false;
                updatedEvent.isInterested = false;
              }
              
              return updatedEvent;
            }
            return event;
          })
        );
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update RSVP status');
      }
    } catch (error) {
      console.error('Error updating RSVP status:', error);
      toast.error('Failed to update RSVP status');
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (!user) {
      toast.error('Please log in to join events');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Successfully joined the event!');
        fetchEvents(); // Refresh events to update attendee count
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    if (!user) {
      toast.error('Please log in to leave events');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Successfully left the event');
        fetchEvents(); // Refresh events to update attendee count
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to leave event');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave event');
    }
  };

  const handleBookmark = async (eventId) => {
    if (!user) {
      toast.error('Please log in to bookmark events');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, isBookmarked: data.isBookmarked }
            : event
        ));
        toast.success(data.isBookmarked ? 'Event bookmarked!' : 'Event removed from bookmarks');
      } else {
        toast.error('Failed to bookmark event');
      }
    } catch (error) {
      console.error('Error bookmarking event:', error);
      toast.error('Failed to bookmark event');
    }
  };

  const handleShare = async (event) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url: `${window.location.origin}/events/${event._id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/events/${event._id}`;
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Event link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    const timeDiff = eventDateObj.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { status: 'past', label: 'Past', color: 'bg-gray-500' };
    } else if (daysDiff === 0) {
      return { status: 'today', label: 'Today', color: 'bg-red-500' };
    } else if (daysDiff === 1) {
      return { status: 'tomorrow', label: 'Tomorrow', color: 'bg-orange-500' };
    } else if (daysDiff <= 7) {
      return { status: 'soon', label: 'Soon', color: 'bg-yellow-500' };
    } else {
      return { status: 'upcoming', label: 'Upcoming', color: 'bg-green-500' };
    }
  };

  const getRSVPStatus = (event) => {
    if (event.isAttending) return 'attending';
    if (event.isInterested) return 'interested';
    if (event.isNotAttending) return 'not-attending';
    return 'none';
  };

  const EventCard = ({ event }) => {
    const eventStatus = getEventStatus(event.date);
    const rsvpStatus = getRSVPStatus(event);
    const isBookmarked = user?.bookmarkedEvents?.includes(event._id);
    const attendeeCount = event.attendeeCount || event.attendees?.length || 0;

    return (
      <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-white/20 overflow-hidden">
        <div className="relative">
          <img
            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
            alt={event.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          
          {/* Top-left badges */}
          <div className="absolute top-4 left-4 flex space-x-2">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm shadow-lg backdrop-blur-sm">
              {event.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-white font-semibold text-sm shadow-lg backdrop-blur-sm ${eventStatus.color}`}>
              {eventStatus.label}
            </span>
          </div>

          {/* Top-right RSVP status badge */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {rsvpStatus === 'attending' && (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm shadow-lg backdrop-blur-sm border border-green-200">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                You're In
              </span>
            )}
            {rsvpStatus === 'interested' && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm shadow-lg backdrop-blur-sm border border-blue-200">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Interested
              </span>
            )}
            {rsvpStatus === 'waitlist' && (
              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm shadow-lg backdrop-blur-sm border border-yellow-200">
                ⏳ Waitlist
              </span>
            )}
            {rsvpStatus === 'not-attending' && (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-sm shadow-lg backdrop-blur-sm border border-red-200">
                👤 Not RSVPed
              </span>
            )}
            
            <button
              onClick={() => handleBookmark(event._id)}
              className={`p-2 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${
                isBookmarked 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-white/90 text-gray-600 hover:text-orange-600 hover:bg-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
            {event.name}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{event.time?.start || 'TBD'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{event.city}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4 text-orange-500" />
              <span>{attendeeCount} people RSVPed</span>
            </div>
          </div>

          {/* RSVP Toggle Buttons */}
          {eventStatus.status !== 'past' && (
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleRSVP(event._id, rsvpStatus === 'attending' ? 'not-attending' : 'attending')}
                  className={`flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 ${
                    rsvpStatus === 'attending' 
                      ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                      : ''
                  }`}
                >
                  {rsvpStatus === 'attending' ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Attending ✓</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      <span>Attend</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleRSVP(event._id, rsvpStatus === 'interested' ? 'not-interested' : 'interested')}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    rsvpStatus === 'interested' 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  }`}
                >
                  {rsvpStatus === 'interested' ? 'Interested ✓' : 'Interested'}
                </button>
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Link
              to={`/events/${event._id}`}
              className="text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors duration-200 flex items-center space-x-1 group/link"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => handleShare(event)}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors duration-200 flex items-center space-x-1"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EventListItem = ({ event }) => {
    const eventStatus = getEventStatus(event.date);
    const rsvpStatus = getRSVPStatus(event);
    const isBookmarked = user?.bookmarkedEvents?.includes(event._id);
    const attendeeCount = event.attendeeCount || event.attendees?.length || 0;

    return (
      <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
              alt={event.name}
              className="w-24 h-24 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute -top-2 -right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${eventStatus.color} text-white`}>
                {eventStatus.label}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                {event.name}
              </h3>
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm shadow-sm">
                {event.category}
              </span>
              {/* RSVP Status Badge */}
              {rsvpStatus === 'attending' && (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm shadow-sm border border-green-200">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  You're In
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mb-4 text-sm line-clamp-2 leading-relaxed">
              {event.description}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{event.time?.start || 'TBD'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{event.city}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-500" />
                <span>{attendeeCount} people RSVPed</span>
              </div>
            </div>

            {/* RSVP Toggle Buttons for List View */}
            {eventStatus.status !== 'past' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleRSVP(event._id, rsvpStatus === 'attending' ? 'not-attending' : 'attending')}
                  className={`bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 ${
                    rsvpStatus === 'attending' 
                      ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                      : ''
                  }`}
                >
                  {rsvpStatus === 'attending' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Attending ✓</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Attend</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleRSVP(event._id, rsvpStatus === 'interested' ? 'not-interested' : 'interested')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    rsvpStatus === 'interested' 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  }`}
                >
                  {rsvpStatus === 'interested' ? 'Interested ✓' : 'Interested'}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleBookmark(event._id)}
              className={`p-3 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${
                isBookmarked 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-white/90 text-gray-600 hover:text-orange-600 hover:bg-white'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => handleShare(event)}
              className="p-3 rounded-full bg-white/90 text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <Link
              to={`/events/${event._id}`}
              className="text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors duration-200 flex items-center space-x-1 group/link"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="event-page-wrapper">
      <div className="mesh-light" />
      <Navbar user={user} setUser={setUser} />
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 lg:px-16 py-16 md:py-24 animate-soft-zoom">
        <div className="flex-1 z-10 events-hero-section-flex">
          <h1 className="events-hero-heading">Unforgettable Events. Genuine Connections.</h1>
          <h2 className="events-hero-subheading">Join conversations that come alive through curated meetups and community gatherings.</h2>
          <p className="events-hero-paragraph">Explore, host, and grow — one event at a time.</p>
        </div>
        <div className="flex-1 flex items-center justify-center relative min-h-[260px] mt-10 md:mt-0">
          <HorizontalCarousel />
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{background: 'transparent'}}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Discover Events
            </h1>
            <p className="text-xl text-gray-600">
              Find and join amazing events happening around you
            </p>
          </div>
          
          {user && (
            <Link
              to="/events/create"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 mt-4 sm:mt-0"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-gray-200 hover:border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-gray-200 hover:border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-gray-200 hover:border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-gray-200 hover:border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                >
                  {dateFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-gray-200 hover:border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="date">Date</option>
                  <option value="popular">Most Popular</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  View
                </label>
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white/20 text-gray-700 hover:bg-white hover:text-orange-600'
                    }`}
                  >
                    <Grid className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white/20 text-gray-700 hover:bg-white hover:text-orange-600'
                    }`}
                  >
                    <List className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 font-medium">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Events Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                {viewMode === 'grid' ? (
                  <>
                    <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                    <div className="bg-gray-200 h-6 rounded mb-3"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </>
                ) : (
                  <div className="flex items-center space-x-6 p-6 bg-white/50 rounded-2xl">
                    <div className="bg-gray-200 w-24 h-24 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="bg-gray-200 h-5 rounded w-1/3"></div>
                      <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No events found
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Try adjusting your search criteria or create a new event
            </p>
            {user && (
              <Link 
                to="/events/create" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Event</span>
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredEvents.map(event => (
              viewMode === 'grid' ? (
                <EventCard key={event._id} event={event} />
              ) : (
                <EventListItem key={event._id} event={event} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events; 