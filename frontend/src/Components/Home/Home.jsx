// Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './Home.css';

const Home = ({ user, setUser, groups, events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredGroups = (groups || []).filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = (events || []).filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar user={user} setUser={setUser} />

      {/* Banner Section */}
      <section className="banner">
        <img
          src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80"
          alt="Coffee Chat Banner"
          className="banner-image"
        />
        <div className="banner-content">
          <h1>Welcome to Coffee Chat</h1>
          <p>Connect with groups, events, and people who share your passion.</p>
          <input
            type="text"
            placeholder="Search city or event..."
            className="search-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Intro Section: Small image left, message right */}
      <section className="intro-section">
        <div className="intro-image">
          <img
            src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Join Chat"
          />
        </div>
        <div className="intro-content">
          <h2>Join the Conversation</h2>
          <p>
            Find groups or start your own chat to connect with people who share your interests.
          </p>
          <div className="intro-buttons">
            <button className="btn-primary" onClick={() => navigate('/groups')}>
              Explore Groups
            </button>
            <button className="btn-secondary" onClick={() => navigate('/events')}>
              Explore Events
            </button>
          </div>
        </div>
      </section>

      {/* Groups and Events Section with unified premium background */}
      <section className="listings-section premium-bg">
        {/* Groups */}
        <h2 id="groups">Groups</h2>
        <div className="cards-container">
          {filteredGroups.length ? (
            filteredGroups.map(group => (
              <div key={group.id} className="card">
                <img src={group.image} alt={group.name} />
                <h3>{group.name}</h3>
                <p>{group.city}</p>
                <p>{group.description}</p>
                <button 
                  className="btn-view"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  View Group
                </button>
              </div>
            ))
          ) : (
            <p>No groups found.</p>
          )}
        </div>

        {/* Events */}
        <h2 id="events">Events</h2>
        <div className="cards-container">
          {filteredEvents.length ? (
            filteredEvents.map(event => (
              <div key={event.id} className="card">
                <img src={event.image} alt={event.name} />
                <h3>{event.name}</h3>
                <p>{event.city}</p>
                <p>{event.date}</p>
                <button 
                  className="btn-view"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  View Event
                </button>
              </div>
            ))
          ) : (
            <p>No events found.</p>
          )}
        </div>
      </section>

      {/* Motivational Box (not full width, premium background) */}
      <section className="motivation-box">
        <h2>Share what you love, build something real!!</h2>
        <p>
          Create your own space to gather like-minded people, spark meaningful conversations,
          and grow something amazing together. Whether it's a skill, an idea, or a dream —
          your community starts with you.
        </p>
        <div className="motivation-buttons">
          <button className="btn-primary" onClick={() => navigate('/groups/create')}>
            Create a Group
          </button>
          <button className="btn-secondary" onClick={() => navigate('/events/create')}>
            Create an Event
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-section">
            <h4>Your Account</h4>
            <ul>
              <li><a href="/signup">Sign up</a></li>
              <li><a href="/login">Log in</a></li>
              <li><a href="/profile">Profile</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Discover</h4>
            <ul>
              <li><a href="/groups">Groups</a></li>
              <li><a href="/events">Events</a></li>
              <li><a href="/groups/create">Create Group</a></li>
              <li><a href="/events/create">Create Event</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>About</h4>
            <ul>
              <li><a href="#">About Coffee Chat</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow us</h4>
            <div className="social-links">
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">Instagram</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Coffee Chat. All rights reserved.</p>
          <ul>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">Help</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
};

export default Home;
