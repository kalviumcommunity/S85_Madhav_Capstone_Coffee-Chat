import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';
import logo from "../../../src/assets/logo.png";

const Navbar = ({ user, setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')}>
        <img src={logo} alt="Coffee Chat Logo" className="logo-image" />
        <span>Coffee Chat</span>
      </div>

      <div className="navbar-links">
        <a href="#explore">Explore</a>
        <a href="#groups">Groups</a>
        <a href="#events">Events</a>

        {user ? (
          <div className="profile-dropdown" ref={dropdownRef}>
            <img
              src={user.profileImage || 'https://via.placeholder.com/40'}
              alt="profile"
              className="profile-pic"
              onClick={() => setMenuOpen(!menuOpen)}
            />
            {menuOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                <Link to="/create" onClick={() => setMenuOpen(false)}>Create</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="login-btn">Log In</Link>
            <Link to="/signup" className="login-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
