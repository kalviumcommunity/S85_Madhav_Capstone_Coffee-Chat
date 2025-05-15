import React from 'react';
import './Navbar.css';
import logo from "../../../src/assets/logo.png"
const Navbar = ({ user }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img
          src={logo} // Replace with your actual logo path
          alt="Coffee Chat Logo"
          className="logo-image"
        />
        <span>Coffee Chat</span>
      </div>

      <div className="navbar-links">
        <a href="#explore">Explore</a>
        <a href="#groups">Groups</a>
        <a href="#events">Events</a>

        {user ? (
          <>
            <a href="#profile">Profile</a>
            <a href="#create" className="create-link">Create</a>
            <img
              src={user.profileImage || 'https://via.placeholder.com/40'}
              alt="profile"
              className="profile-pic"
            />
          </>
        ) : (
          <a href="#login" className="login-btn">Log In</a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
