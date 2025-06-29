import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { getAuth, signOut } from 'firebase/auth';

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'Groups', to: '/groups' },
  { name: 'Events', to: '/events' },
];

export default function Navbar({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur shadow-md ${
        scrolled ? 'py-2 shadow-lg' : 'py-4'
      }`}
      style={{ boxShadow: scrolled ? '0 4px 24px 0 rgba(255,171,54,0.10)' : '0 2px 8px 0 rgba(0,0,0,0.04)' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-orange-500">
          <span className="inline-block w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shadow-sm">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><ellipse cx="12" cy="17" rx="7" ry="3" fill="#FFAB36"/><path d="M5 17V8a7 7 0 0 1 14 0v9" stroke="#FFAB36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 13a3 3 0 0 0 3-3V8" stroke="#FFAB36" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
          Coffee Chat
        </Link>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.to}
              className={`text-base font-medium transition-colors duration-200 px-2 py-1 rounded-lg ${
                location.pathname === link.to
                  ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {/* Profile/Login logic */}
          {user ? (
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-orange-100 hover:bg-orange-200 transition shadow"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="Open profile menu"
              >
                <img
                  src={user.photoURL || user.profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png'}
                  alt={user.displayName || user.name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-orange-300"
                />
                <span className="hidden sm:inline text-gray-800 font-medium">{user.displayName || user.name || user.email}</span>
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg py-2 z-50 animate-fadeInDown border border-orange-100">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-orange-50 rounded-lg transition"
                    onClick={() => {
                      // Call the same handleLogout function that works in debug panel
                      const auth = getAuth();
                      signOut(auth).then(() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        sessionStorage.clear();
                        window.location.href = '/';
                      });
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="ml-2 px-4 py-2 rounded-full bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="ml-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-semibold shadow hover:bg-orange-200 transition-all duration-200 border border-orange-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-orange-500 hover:bg-orange-100 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Open menu"
        >
          {mobileOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-2xl px-4 pt-2 pb-4 animate-fadeInDown">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.to}
              className={`block w-full text-base font-medium px-2 py-2 rounded-lg mt-1 ${
                location.pathname === link.to
                  ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <div className="mt-2 flex items-center gap-2 px-2">
              <img
                src={user.photoURL || user.profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png'}
                alt={user.displayName || user.name || 'Profile'}
                className="w-8 h-8 rounded-full object-cover border-2 border-orange-300"
              />
              <span className="text-gray-800 font-medium">{user.displayName || user.name || user.email}</span>
              <button
                className="ml-auto px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-semibold shadow hover:bg-orange-200 transition-all duration-200 border border-orange-200"
                onClick={() => {
                  // Call the same handleLogout function that works in debug panel
                  const auth = getAuth();
                  signOut(auth).then(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    sessionStorage.clear();
                    window.location.href = '/';
                  });
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-semibold shadow hover:bg-orange-200 transition-all duration-200 border border-orange-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
