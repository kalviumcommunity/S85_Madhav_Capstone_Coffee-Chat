import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../Components/Navbar/Navbar';
import './GroupDetails.css';

const GroupDetails = ({ user, setUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [groupRes, membersRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/groups/${id}`, { headers }),
        axios.get(`http://localhost:3000/api/groups/${id}/members`, { headers })
      ]);

      setGroup(groupRes.data);
      setMembers(membersRes.data);
      setIsMember(groupRes.data.isMember || false);
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setJoining(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/groups/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsMember(true);
      setGroup(prev => ({ ...prev, memberCount: (prev.memberCount || 0) + 1 }));
      fetchGroupDetails(); // Refresh to get updated member list
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    setJoining(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/groups/${id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsMember(false);
      setGroup(prev => ({ ...prev, memberCount: Math.max(0, (prev.memberCount || 0) - 1) }));
      fetchGroupDetails(); // Refresh to get updated member list
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="loading">Loading group details...</div>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="error">Group not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="group-details-container">
        <div className="group-hero">
          <img 
            src={group.image || 'https://via.placeholder.com/1200x400?text=Group'} 
            alt={group.name}
            className="group-hero-image"
          />
          <div className="group-hero-overlay">
            <div className="group-hero-content">
              <h1>{group.name}</h1>
              <p className="group-location">📍 {group.city}</p>
              <p className="group-members-count">👥 {group.memberCount || 0} members</p>
            </div>
          </div>
        </div>

        <div className="group-content-wrapper">
          <div className="group-main-content">
            <div className="group-description-section">
              <h2>About this group</h2>
              <p>{group.description}</p>
            </div>

            <div className="group-members-section">
              <h2>Members ({members.length})</h2>
              <div className="members-grid">
                {members.map(member => (
                  <div key={member._id} className="member-card">
                    <img 
                      src={member.profileImage || 'https://via.placeholder.com/60x60?text=User'} 
                      alt={member.name}
                      className="member-avatar"
                    />
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <p>{member.location || 'Location not set'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="group-sidebar">
            <div className="group-actions-card">
              {user ? (
                isMember ? (
                  <button 
                    className="btn-leave-group"
                    onClick={handleLeaveGroup}
                    disabled={joining}
                  >
                    {joining ? 'Leaving...' : 'Leave Group'}
                  </button>
                ) : (
                  <button 
                    className="btn-join-group"
                    onClick={handleJoinGroup}
                    disabled={joining}
                  >
                    {joining ? 'Joining...' : 'Join Group'}
                  </button>
                )
              ) : (
                <button 
                  className="btn-join-group"
                  onClick={() => navigate('/login')}
                >
                  Login to Join
                </button>
              )}
            </div>

            <div className="group-info-card">
              <h3>Group Information</h3>
              <div className="info-item">
                <span className="info-label">Location:</span>
                <span className="info-value">{group.city}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Members:</span>
                <span className="info-value">{group.memberCount || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {new Date(group.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupDetails; 