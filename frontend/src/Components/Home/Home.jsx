// Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import Navbar from '../Navbar/Navbar';
import { 
  Search, 
  MapPin, 
  Users, 
  Calendar, 
  ArrowRight,
  Star,
  TrendingUp,
  Coffee,
  Heart,
  Clock,
  Eye,
  Plus,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin as LocationIcon,
  Laptop,
  Dumbbell,
  Music,
  Palette,
  Pizza,
  Plane
} from 'lucide-react';
import { UsersThree, CalendarPlus, ChartLineUp, ChatCircleText } from 'phosphor-react';
import SearchResults from '../../pages/SearchResults/SearchResults';
import BACKEND_URL from '../../config';

const Home = ({ user, setUser }) => {
  const [featuredGroups, setFeaturedGroups] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      setLoading(true);
      
      // Fetch featured groups
      const groupsResponse = await fetch(`${BACKEND_URL}/api/groups/featured`);
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setFeaturedGroups(groupsData.slice(0, 6));
      }

      // Fetch featured events
      const eventsResponse = await fetch(`${BACKEND_URL}/api/events/featured`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setFeaturedEvents(eventsData.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'Technology', icon: Laptop, route: '/groups?category=Technology' },
    { name: 'Sports', icon: Dumbbell, route: '/groups?category=Sports' },
    { name: 'Music', icon: Music, route: '/groups?category=Music' },
    { name: 'Art', icon: Palette, route: '/events?category=Art' },
    { name: 'Food', icon: Pizza, route: '/events?category=Food' },
    { name: 'Travel', icon: Plane, route: '/groups?category=Travel' },
  ];

  const stats = [
    { label: 'Active Groups', value: '500+', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Upcoming Events', value: '1000+', icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Happy Members', value: '10K+', icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-24">
      <Navbar user={user} setUser={setUser} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/banner image.jpg"
            alt="Warm and cozy cafe scene with diverse young adults chatting around a wooden table"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          {/* Additional Blur Effect for Text Areas */}
          <div className="absolute inset-0 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white/90 mb-6">
              <Coffee className="w-5 h-5" />
              <span className="text-sm font-medium">Join the community</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
            Connect Over
            <span className="block text-orange-200 mt-2">Coffee & Conversations</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-orange-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Discover amazing groups, attend exciting events, and build meaningful connections 
            with people who share your interests. Your next great conversation starts here.
          </p>
          
          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
                <div className="flex items-center p-2">
                  <div className="flex-1 flex items-center px-6 py-4">
                    <Search className="w-6 h-6 text-gray-400 mr-4" />
                    <input
                      type="text"
                      placeholder="Search for groups, events, or people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 text-lg focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/groups"
              className="group bg-white text-orange-600 hover:bg-orange-50 px-10 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Users className="w-6 h-6" />
              <span>Explore Groups</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/events"
              className="group border-2 border-white text-white hover:bg-white hover:text-orange-600 px-10 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 backdrop-blur-sm"
            >
              <Calendar className="w-6 h-6" />
              <span>Find Events</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Premium Feature Section */}
      <section className="bg-[#FFF8F1] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            Coffee Chat makes it easy to connect and grow
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 1st Feature */}
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersThree size={32} weight="duotone" className="text-pink-500" />
              </div>
              <div className="font-semibold text-lg mb-2">Like-Minded People</div>
              <div className="text-sm text-muted-foreground mb-2">
                Discover and join groups of people who share your passions.
              </div>
              <a href="/groups" className="text-orange-500 text-sm font-medium mt-2 inline-block hover:underline">
                Start now ▶
              </a>
            </div>
            {/* 2nd Feature */}
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarPlus size={32} weight="duotone" className="text-blue-500" />
              </div>
              <div className="font-semibold text-lg mb-2">Simple Tools</div>
              <div className="text-sm text-muted-foreground mb-2">
                Create and manage events with ease — right from your dashboard.
              </div>
              <a href="/create-event" className="text-orange-500 text-sm font-medium mt-2 inline-block hover:underline">
                Start now ▶
              </a>
            </div>
            {/* 3rd Feature */}
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartLineUp size={32} weight="duotone" className="text-green-500" />
              </div>
              <div className="font-semibold text-lg mb-2">Grow Organically</div>
              <div className="text-sm text-muted-foreground mb-2">
                Create a group and we'll help you grow it through discovery tools.
              </div>
              <a href="/create-group" className="text-orange-500 text-sm font-medium mt-2 inline-block hover:underline">
                Start now ▶
              </a>
            </div>
            {/* 4th Feature */}
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatCircleText size={32} weight="duotone" className="text-yellow-500" />
              </div>
              <div className="font-semibold text-lg mb-2">Real Conversations</div>
              <div className="text-sm text-muted-foreground mb-2">
                Attend events and spark meaningful conversations that matter.
              </div>
              <a href="/events" className="text-orange-500 text-sm font-medium mt-2 inline-block hover:underline">
                Start now ▶
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Category Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
              Explore by Category
            </h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              Find groups and events that match your interests and passions
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 py-12">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  to={category.route}
                  className="flex flex-col items-center justify-center space-y-2 border border-gray-200 rounded-xl px-4 py-6 transition-all hover:shadow-md hover:-translate-y-1"
                >
                  <Icon className="w-6 h-6 text-black" />
                  <span className="text-sm font-medium text-black">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Groups Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trending Groups
              </h2>
              <p className="text-xl text-gray-600">
                Join the most popular groups in your area
              </p>
            </div>
            <Link
              to="/groups"
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-200 group"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                  <div className="bg-gray-200 h-6 rounded mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGroups.map((group) => (
                <Link
                  key={group._id}
                  to={`/groups/${group._id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={group.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
                      alt={group.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${categories.find(c => c.name === group.category)?.color || 'bg-gray-100 text-gray-700'}`}>
                        {group.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                        <Eye className="w-4 h-4 inline mr-1" />
                        {group.memberCount || group.members?.length || 0}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-200">
                      {group.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{group.city}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{group.memberCount || group.members?.length || 0} members</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-gray-600">
                Don't miss out on these exciting events
              </p>
            </div>
            <Link
              to="/events"
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-200 group"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                  <div className="bg-gray-200 h-6 rounded mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
                      alt={event.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${categories.find(c => c.name === event.category)?.color || 'bg-gray-100 text-gray-700'}`}>
                        {event.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-200">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.city}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{event.attendeeCount || event.attendees?.length || 0} attending</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white/90 mb-6">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Join the community</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Connecting?
          </h2>
          <p className="text-xl text-orange-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of people who are already building meaningful connections 
            through Coffee Chat. Your next great conversation is waiting.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {!user ? (
              <>
                <Link
                  to="/signup"
                  className="group bg-white text-orange-600 hover:bg-orange-50 px-10 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/groups"
                  className="group border-2 border-white text-white hover:bg-white hover:text-orange-600 px-10 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 backdrop-blur-sm"
                >
                  <Users className="w-6 h-6" />
                  <span>Explore Groups</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            ) : (
              <Link
                to="/groups"
                className="group bg-white text-orange-600 hover:bg-orange-50 px-10 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <Users className="w-6 h-6" />
                <span>Discover Groups</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Premium Copyright Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Orange Radial Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {/* Main Footer Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              
              {/* About Coffee Chat */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-6">
                  <img 
                    src="/Main Logo.png" 
                    alt="Coffee Chat Logo" 
                    className="h-8 w-auto object-contain"
                  />
                  <h3 className="text-xl font-bold text-white">Coffee Chat</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Connect over coffee and conversations. Build meaningful relationships through shared interests and exciting events.
                </p>
                <div className="space-y-2">
                  <Link to="/about#our-story" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Our Story</Link>
                  <Link to="/about#how-it-works" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">How it Works</Link>
                  <Link to="/about#careers" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Careers</Link>
                  <Link to="/about#blog" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Blog</Link>
                </div>
              </div>

              {/* Your Account */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-6">Your Account</h3>
                <div className="space-y-2">
                  <Link to="/login" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Login</Link>
                  <Link to="/signup" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Sign Up</Link>
                  <Link to="/dashboard" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Dashboard</Link>
                  <Link to="/settings" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Settings</Link>
                </div>
              </div>

              {/* Discover */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-6">Discover</h3>
                <div className="space-y-2">
                  <Link to="/groups" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Groups</Link>
                  <Link to="/events" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Events</Link>
                  <Link to="/categories" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Categories</Link>
                  <Link to="/search" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Search</Link>
                </div>
              </div>

              {/* Help & Legal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-6">Help & Legal</h3>
                <div className="space-y-2">
                  <Link to="/contact" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Contact Us</Link>
                  <Link to="/terms" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Terms of Service</Link>
                  <Link to="/privacy" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Privacy Policy</Link>
                  <Link to="/cookie-policy" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Cookie Policy</Link>
                  <Link to="/support" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200">Support</Link>
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <div className="flex flex-col items-center space-y-6">
                <h4 className="text-lg font-semibold text-white">Follow Us</h4>
                <div className="flex space-x-4">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group w-12 h-12 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group w-12 h-12 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25"
                    aria-label="Follow us on Twitter"
                  >
                    <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group w-12 h-12 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25"
                    aria-label="Follow us on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group w-12 h-12 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25"
                    aria-label="Follow us on YouTube"
                  >
                    <Youtube className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-gray-400 text-sm">
                  © 2025 Coffee Chat. All rights reserved.
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <span>Made with</span>
                  <Coffee className="w-4 h-4 text-orange-400" />
                  <span>by</span>
                  <span className="text-orange-400 font-semibold">Madhav Garg</span>
                  <span>• India • v1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
