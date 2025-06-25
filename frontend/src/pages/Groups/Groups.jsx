import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../Components/Navbar/Navbar';
import './Groups.css';

const Groups = ({ user, setUser }) => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [joiningGroup, setJoiningGroup] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setJoiningGroup(groupId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the groups list to reflect the join
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group._id === groupId 
            ? { ...group, isMember: true, memberCount: (group.memberCount || 0) + 1 }
            : group
        )
      );
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    } finally {
      setJoiningGroup(null);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="loading">Loading groups...</div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="groups-container">
        <div className="groups-header">
          <h1>Explore Groups</h1>
          <p>Find and join groups that match your interests</p>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search groups by name, city, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {user && (
            <button 
              className="btn-create-group"
              onClick={() => navigate('/groups/create')}
            >
              Create New Group
            </button>
          )}
        </div>

        <div className="groups-grid">
          {filteredGroups.length > 0 ? (
            filteredGroups.map(group => (
              <div key={group._id} className="group-card">
                <div className="group-image">
                  <img 
                    src={group.image || 'https://via.placeholder.com/400x250?text=Group'} 
                    alt={group.name} 
                  />
                </div>
                <div className="group-content">
                  <h3>{group.name}</h3>
                  <p className="group-location">
                    📍 {group.city}
                  </p>
                  <p className="group-members">
                    👥 {group.memberCount || 0} members
                  </p>
                  <p className="group-description">
                    {group.description}
                  </p>
                  <div className="group-actions">
                    <button 
                      className="btn-view-group"
                      onClick={() => navigate(`/groups/${group._id}`)}
                    >
                      View Details
                    </button>
                    {user && (
                      <button 
                        className={`btn-join-group ${group.isMember ? 'joined' : ''}`}
                        onClick={() => handleJoinGroup(group._id)}
                        disabled={joiningGroup === group._id || group.isMember}
                      >
                        {joiningGroup === group._id ? 'Joining...' : 
                         group.isMember ? 'Joined' : 'Join Group'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No groups found</h3>
              <p>Try adjusting your search terms or create a new group!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Groups; 