import { useState, useEffect } from 'react';
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
  Share2
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import toast from 'react-hot-toast';

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
              } else if (rsvpType === 'not-interested') {
                updatedEvent.isInterested = false;
              }
              
              return updatedEvent;
            }
            return event;
          })
        );
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to RSVP');
      }
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      toast.error('Failed to RSVP');
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
        const data = await response.json();
        toast.success(data.message || 'Successfully joined event!');
        fetchEvents(); // Refresh events to update attendee count
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Successfully left event');
        fetchEvents(); // Refresh events to update attendee count
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to leave event');
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/users/bookmark-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      });

      if (response.ok) {
        toast.success('Event bookmarked!');
        fetchEvents();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to bookmark event');
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
    
    if (isBefore(eventDateObj, now)) {
      return { status: 'past', label: 'Past Event', color: 'bg-secondary-500' };
    } else if (isAfter(eventDateObj, addDays(now, 7))) {
      return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-500' };
    } else {
      return { status: 'soon', label: 'Soon', color: 'bg-orange-500' };
    }
  };

  // Helper to get RSVP status
  const getRSVPStatus = (event) => {
    if (event.isAttending) return 'attending';
    if (event.isOnWaitlist) return 'waitlist';
    if (event.isInterested) return 'interested';
    if (event.isNotAttending) return 'not-attending';
    return 'not-rsvped';
  };

  const EventCard = ({ event }) => {
    const eventStatus = getEventStatus(event.date);
    const rsvpStatus = getRSVPStatus(event);
    const isBookmarked = user?.bookmarkedEvents?.includes(event._id);
    const attendeeCount = event.attendeeCount || event.attendees?.length || 0;

    return (
      <div className="card-hover group bg-white dark:bg-secondary-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] border border-secondary-200 dark:border-secondary-700">
        <div className="relative">
          <img
            src={event.image || 'https://via.placeholder.com/400x200'}
            alt={event.name}
            className="w-full h-48 object-cover rounded-t-xl"
          />
          
          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex space-x-2">
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium shadow-sm">
              {event.category}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full text-white font-medium shadow-sm ${eventStatus.color}`}>
              {eventStatus.label}
            </span>
          </div>

          {/* Top-right RSVP status badge */}
          <div className="absolute top-3 right-3 flex space-x-2">
            {rsvpStatus === 'attending' && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium shadow-sm border border-green-200">
                ✅ You're In
              </span>
            )}
            {rsvpStatus === 'interested' && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium shadow-sm border border-blue-200">
                🤔 Interested
              </span>
            )}
            {rsvpStatus === 'waitlist' && (
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium shadow-sm border border-yellow-200">
                ⏳ Waitlist
              </span>
            )}
            {rsvpStatus === 'not-attending' && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium shadow-sm border border-red-200">
                👤 Not RSVPed
              </span>
            )}
            
            <button
              onClick={() => handleBookmark(event._id)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isBookmarked 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white/90 dark:bg-secondary-800/90 text-secondary-600 hover:text-primary-600'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">
            {event.name}
          </h3>
          
          <p className="text-secondary-600 dark:text-secondary-300 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-secondary-500 dark:text-secondary-400">
              <Calendar className="w-4 h-4 opacity-70" />
              <span className="opacity-80">{format(new Date(event.date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-secondary-500 dark:text-secondary-400">
              <Clock className="w-4 h-4 opacity-70" />
              <span className="opacity-80">{event.time?.start || 'TBD'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-secondary-500 dark:text-secondary-400">
              <MapPin className="w-4 h-4 opacity-70" />
              <span className="opacity-80">{event.city}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-secondary-500 dark:text-secondary-400">
              <Users className="w-4 h-4 opacity-70" />
              <span className="opacity-80">{attendeeCount} people RSVPed</span>
            </div>
          </div>

          {/* RSVP Toggle Buttons */}
          {eventStatus.status !== 'past' && (
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleRSVP(event._id, rsvpStatus === 'attending' ? 'not-attending' : 'attending')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    rsvpStatus === 'attending' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {rsvpStatus === 'attending' ? (
                    <>
                      <span>Not Attend</span>
                    </>
                  ) : (
                    <>
                      <span>Attend</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleRSVP(event._id, rsvpStatus === 'interested' ? 'not-interested' : 'interested')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    rsvpStatus === 'interested' 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-secondary-100 hover:bg-secondary-200 text-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-600 dark:text-secondary-300'
                  }`}
                >
                  {rsvpStatus === 'interested' ? 'Not Interested' : 'Interested'}
                </button>
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to={`/events/${event._id}`}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
            >
              View Details →
            </Link>
            <button
              onClick={() => handleShare(event)}
              className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300 text-sm font-medium transition-colors duration-200"
            >
              Share
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
      <div className="card-hover group bg-white dark:bg-secondary-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center space-x-4">
          <img
            src={event.image || 'https://via.placeholder.com/80x80'}
            alt={event.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                {event.name}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium shadow-sm">
                {event.category}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full text-white font-medium shadow-sm ${eventStatus.color}`}>
                {eventStatus.label}
              </span>
              {/* RSVP Status Badge */}
              {rsvpStatus === 'attending' && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium shadow-sm border border-green-200">
                  ✅ You're In
                </span>
              )}
            </div>
            
            <p className="text-secondary-600 dark:text-secondary-300 mb-3 text-sm line-clamp-1">
              {event.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400 mb-3">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 opacity-70" />
                <span className="opacity-80">{format(new Date(event.date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 opacity-70" />
                <span className="opacity-80">{event.time?.start || 'TBD'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 opacity-70" />
                <span className="opacity-80">{event.city}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 opacity-70" />
                <span className="opacity-80">{attendeeCount} people RSVPed</span>
              </div>
            </div>

            {/* RSVP Toggle Buttons for List View */}
            {eventStatus.status !== 'past' && (
              <div className="space-y-2 mb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRSVP(event._id, rsvpStatus === 'attending' ? 'not-attending' : 'attending')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                      rsvpStatus === 'attending' 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {rsvpStatus === 'attending' ? 'Not Attend' : 'Attend'}
                  </button>
                  
                  <button
                    onClick={() => handleRSVP(event._id, rsvpStatus === 'interested' ? 'not-interested' : 'interested')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                      rsvpStatus === 'interested' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-secondary-100 hover:bg-secondary-200 text-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-600 dark:text-secondary-300'
                    }`}
                  >
                    {rsvpStatus === 'interested' ? 'Not Interested' : 'Interested'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBookmark(event._id)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isBookmarked 
                  ? 'bg-primary-600 text-white' 
                  : 'text-secondary-400 hover:text-primary-600'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare(event)}
              className="p-2 rounded-full text-secondary-400 hover:text-secondary-600 transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <Link
              to={`/events/${event._id}`}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Navbar user={user} setUser={setUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
              Discover Events
            </h1>
            <p className="text-secondary-600 dark:text-secondary-300">
              Find and attend exciting events in your area
            </p>
          </div>
          
          {user && (
            <Link
              to="/events/create"
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="input-field"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                >
                  {dateFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="date">Date</option>
                  <option value="popular">Most Popular</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  View
                </label>
                <div className="flex border border-secondary-300 dark:border-secondary-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                    }`}
                  >
                    <Grid className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700'
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
          <p className="text-secondary-600 dark:text-secondary-300">
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
                    <div className="bg-secondary-200 dark:bg-secondary-700 h-48 rounded-lg mb-4"></div>
                    <div className="bg-secondary-200 dark:bg-secondary-700 h-4 rounded mb-2"></div>
                    <div className="bg-secondary-200 dark:bg-secondary-700 h-3 rounded w-2/3"></div>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="bg-secondary-200 dark:bg-secondary-700 w-20 h-20 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-secondary-200 dark:bg-secondary-700 h-4 rounded w-1/3"></div>
                      <div className="bg-secondary-200 dark:bg-secondary-700 h-3 rounded w-2/3"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No events found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-300 mb-6">
              Try adjusting your search criteria or create a new event
            </p>
            {user && (
              <Link to="/events/create" className="btn-primary">
                Create Your First Event
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