import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../Components/Navbar/Navbar';
import './Events.css';

const Events = ({ user, setUser }) => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [joiningEvent, setJoiningEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setJoiningEvent(eventId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/events/${eventId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the events list to reflect the join
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { ...event, isAttending: true, attendeeCount: (event.attendeeCount || 0) + 1 }
            : event
        )
      );
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Failed to join event');
    } finally {
      setJoiningEvent(null);
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="loading">Loading events...</div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="events-container">
        <div className="events-header">
          <h1>Explore Events</h1>
          <p>Discover and join exciting events in your area</p>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search events by name, city, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {user && (
            <button 
              className="btn-create-event"
              onClick={() => navigate('/events/create')}
            >
              Create New Event
            </button>
          )}
        </div>

        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <div key={event._id} className="event-card">
                <div className="event-image">
                  <img 
                    src={event.image || 'https://via.placeholder.com/400x250?text=Event'} 
                    alt={event.name} 
                  />
                  <div className="event-date-badge">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="event-content">
                  <h3>{event.name}</h3>
                  <p className="event-location">
                    📍 {event.city}
                  </p>
                  <p className="event-date">
                    📅 {formatDate(event.date)}
                  </p>
                  <p className="event-attendees">
                    👥 {event.attendeeCount || 0} attending
                  </p>
                  <p className="event-description">
                    {event.description}
                  </p>
                  <div className="event-actions">
                    <button 
                      className="btn-view-event"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      View Details
                    </button>
                    {user && (
                      <button 
                        className={`btn-join-event ${event.isAttending ? 'attending' : ''}`}
                        onClick={() => handleJoinEvent(event._id)}
                        disabled={joiningEvent === event._id || event.isAttending}
                      >
                        {joiningEvent === event._id ? 'Joining...' : 
                         event.isAttending ? 'Attending' : 'Join Event'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No events found</h3>
              <p>Try adjusting your search terms or create a new event!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Events; 