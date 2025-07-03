import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { getAuth, signOut } from 'firebase/auth';
import { ChevronDown, User as UserIcon, LogOut } from 'lucide-react';

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'Groups', to: '/groups' },
  { name: 'Events', to: '/events' },
];

export default function Navbar({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

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
    setMobileDropdownOpen(false);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
      }
    }
    if (mobileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileDropdownOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur shadow-md ${
        scrolled ? 'py-2 shadow-lg' : 'py-4'
      }`}
      style={{ boxShadow: scrolled ? '0 4px 24px 0 rgba(255,171,54,0.10)' : '0 2px 8px 0 rgba(0,0,0,0.04)' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center text-xl font-bold text-orange-500 gap-2">
          <img 
            src="/Main Logo.png" 
            alt="Coffee Chat Logo" 
            className="h-10 w-10 object-contain align-middle"
          />
          <span className="ml-2 text-gray-900 font-extrabold tracking-tight text-lg sm:text-xl align-middle flex items-center h-10">Coffee Chat</span>
        </Link>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.to}
              className={`text-base font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                location.pathname === link.to
                  ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {/* Profile/Login logic */}
          {user ? (
            <>
              {/* Desktop Dropdown */}
              <div ref={dropdownRef} className="relative ml-2 w-full hidden md:block">
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded-full bg-orange-50 hover:bg-orange-100 transition-all duration-200 shadow border border-orange-100 group w-full md:w-auto"
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-label="Open profile menu"
                >
                  <img
                    src={user?.profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png'}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-orange-200 group-hover:scale-105 group-hover:border-orange-400 transition-all duration-200 shadow"
                  />
                  <span className="hidden md:inline text-gray-800 font-medium">{user.displayName || user.name || user.email}</span>
                  <ChevronDown className="w-4 h-4 text-orange-500 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 animate-fadeInDown border border-orange-100 ring-1 ring-orange-100">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg transition-all duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 text-orange-500" /> Profile
                    </Link>
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                      onClick={() => {
                        const auth = getAuth();
                        signOut(auth).then(() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          sessionStorage.clear();
                          window.location.href = '/';
                        });
                      }}
                    >
                      <LogOut className="w-4 h-4 text-red-500" /> Logout
                    </button>
                  </div>
                )}
              </div>
              {/* Mobile Dropdown */}
              <div ref={mobileDropdownRef} className="mt-4 flex flex-col gap-2 px-2 md:hidden w-full">
                <button
                  className="flex items-center gap-2 w-full px-2 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all duration-200 border border-orange-100 shadow"
                  onClick={() => setMobileDropdownOpen((v) => !v)}
                  aria-label="Open profile menu"
                >
                  <img
                    src={user?.profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png'}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-orange-200"
                  />
                  <span className="text-gray-800 font-medium truncate flex-1 text-left">{user.displayName || user.name || user.email}</span>
                  <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform duration-200 ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileDropdownOpen && (
                  <div className="w-full bg-white rounded-xl shadow-lg py-2 z-50 animate-fadeInDown border border-orange-100 ring-1 ring-orange-100 mt-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg transition-all duration-200"
                      onClick={() => setMobileDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 text-orange-500" /> Profile
                    </Link>
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                      onClick={() => {
                        const auth = getAuth();
                        signOut(auth).then(() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          sessionStorage.clear();
                          window.location.href = '/';
                        });
                      }}
                    >
                      <LogOut className="w-4 h-4 text-red-500" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
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
                Get Started
              </Link>
            </>
          )}
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-orange-500 hover:bg-orange-100 transition-all duration-200"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Open menu"
        >
          {mobileOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-2xl px-4 pt-2 pb-4 animate-fadeInDown">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.to}
                className={`block w-full text-base font-medium px-2 py-2 rounded-lg mt-1 transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {user ? (
            <div className="mt-4 flex flex-col gap-2 px-2">
              <button
                className="flex items-center gap-2 w-full px-2 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all duration-200 border border-orange-100 shadow"
                onClick={() => setMobileDropdownOpen((v) => !v)}
                aria-label="Open profile menu"
              >
                <img
                  src={user?.profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png'}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-orange-200"
                />
                <span className="text-gray-800 font-medium truncate flex-1 text-left">{user.displayName || user.name || user.email}</span>
                <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform duration-200 ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileDropdownOpen && (
                <div className="w-full bg-white rounded-xl shadow-lg py-2 z-50 animate-fadeInDown border border-orange-100 ring-1 ring-orange-100 mt-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg transition-all duration-200"
                    onClick={() => setMobileDropdownOpen(false)}
                  >
                    <UserIcon className="w-4 h-4 text-orange-500" /> Profile
                  </Link>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                    onClick={() => {
                      const auth = getAuth();
                      signOut(auth).then(() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        sessionStorage.clear();
                        window.location.href = '/';
                      });
                    }}
                  >
                    <LogOut className="w-4 h-4 text-red-500" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full block px-4 py-2 rounded-full bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition-all duration-200 text-center"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="w-full block px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-semibold shadow hover:bg-orange-200 transition-all duration-200 border border-orange-200 text-center"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
