// Home.jsx
import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './Home.css';

const Home = ({ user, groups, events }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
      <Navbar user={user} />

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
        <img
          src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80"
          alt="Join Chat"
          className="intro-image"
        />
        <div className="intro-content">
          <h2>Join the Conversation</h2>
          <p>
            Find groups or start your own chat to connect with people who share your interests.
          </p>
          <div className="intro-buttons">
            <button className="btn-primary" onClick={() => alert('Join a chat clicked')}>
              Join a Chat
            </button>
            <button className="btn-secondary" onClick={() => alert('Start a chat clicked')}>
              Start a Chat
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
          and grow something amazing together. Whether it’s a skill, an idea, or a dream —
          your community starts with you.
        </p>
        <div className="motivation-buttons">
          <button className="btn-primary" onClick={() => alert('Create Group clicked')}>
            Create a Group
          </button>
          <button className="btn-secondary" onClick={() => alert('Create Event clicked')}>
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
              <li><a href="#">Sign up</a></li>
              <li><a href="#">Log in</a></li>
              <li><a href="#">Help</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Discover</h4>
            <ul>
              <li><a href="#">Groups</a></li>
              <li><a href="#">Calendar</a></li>
              <li><a href="#">Topics</a></li>
              <li><a href="#">Cities</a></li>
              <li><a href="#">Online Events</a></li>
              <li><a href="#">Local Guides</a></li>
              <li><a href="#">Make Friends</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Meetup</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Meetup Pro</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Apps</a></li>
              <li><a href="#">Podcast</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow us</h4>
            <div className="app-badges">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
              />
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
              />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Coffee Chat. All rights reserved.</p>
          <ul>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">License Attribution</a></li>
            <li><a href="#">Help</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
};

export default Home;
