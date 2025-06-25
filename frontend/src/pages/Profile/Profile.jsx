import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../Components/Navbar/Navbar';
import './Profile.css';

const Profile = ({ user, setUser }) => {
  const [userGroups, setUserGroups] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user's groups and events
        const [groupsRes, eventsRes] = await Promise.all([
          axios.get('http://localhost:3000/api/groups/user', { headers }),
          axios.get('http://localhost:3000/api/events/user', { headers })
        ]);

        setUserGroups(groupsRes.data);
        setUserEvents(eventsRes.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={user.profileImage || 'https://via.placeholder.com/150x150?text=Profile'}
              alt="Profile"
              className="profile-image"
            />
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-location">{user.location || 'Location not set'}</p>
            <button 
              className="btn-edit-profile"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="profile-content">
            <div className="profile-section">
              <h2>My Groups ({userGroups.length})</h2>
              <div className="cards-grid">
                {userGroups.length > 0 ? (
                  userGroups.map(group => (
                    <div key={group._id} className="card">
                      <img src={group.image || 'https://via.placeholder.com/300x200?text=Group'} alt={group.name} />
                      <div className="card-content">
                        <h3>{group.name}</h3>
                        <p className="card-location">{group.city}</p>
                        <p className="card-description">{group.description}</p>
                        <button 
                          className="btn-view"
                          onClick={() => navigate(`/groups/${group._id}`)}
                        >
                          View Group
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-items">You haven't joined any groups yet.</p>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h2>My Events ({userEvents.length})</h2>
              <div className="cards-grid">
                {userEvents.length > 0 ? (
                  userEvents.map(event => (
                    <div key={event._id} className="card">
                      <img src={event.image || 'https://via.placeholder.com/300x200?text=Event'} alt={event.name} />
                      <div className="card-content">
                        <h3>{event.name}</h3>
                        <p className="card-location">{event.city}</p>
                        <p className="card-date">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="card-description">{event.description}</p>
                        <button 
                          className="btn-view"
                          onClick={() => navigate(`/events/${event._id}`)}
                        >
                          View Event
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-items">You haven't joined any events yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile; 