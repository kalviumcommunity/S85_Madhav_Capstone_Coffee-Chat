// Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { 
  Search, 
  MapPin, 
  Users, 
  Calendar, 
  ArrowRight,
  Star,
  TrendingUp,
  Coffee
} from 'lucide-react';

const Home = ({ user, setUser }) => {
  const [featuredGroups, setFeaturedGroups] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      setLoading(true);
      
      // Fetch featured groups
      const groupsResponse = await fetch('http://localhost:3000/api/groups/featured');
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setFeaturedGroups(groupsData.slice(0, 6));
      }

      // Fetch featured events
      const eventsResponse = await fetch('http://localhost:3000/api/events/featured');
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
      // Navigate to search results page or implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const categories = [
    { name: 'Technology', icon: '💻', color: 'bg-blue-100 text-blue-600' },
    { name: 'Sports', icon: '⚽', color: 'bg-green-100 text-green-600' },
    { name: 'Music', icon: '🎵', color: 'bg-purple-100 text-purple-600' },
    { name: 'Art', icon: '🎨', color: 'bg-pink-100 text-pink-600' },
    { name: 'Food', icon: '🍕', color: 'bg-orange-100 text-orange-600' },
    { name: 'Travel', icon: '✈️', color: 'bg-indigo-100 text-indigo-600' },
  ];

  const stats = [
    { label: 'Active Groups', value: '500+', icon: Users },
    { label: 'Upcoming Events', value: '1000+', icon: Calendar },
    { label: 'Happy Members', value: '10K+', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Navbar user={user} setUser={setUser} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect Over
              <span className="block text-primary-200">Coffee & Conversations</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Discover amazing groups, attend exciting events, and build meaningful connections 
              with people who share your interests.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for groups, events, or people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-secondary-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/groups"
                className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Explore Groups</span>
              </Link>
              <Link
                to="/events"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Find Events</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
                    <stat.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-300">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">
              Explore by Category
            </h2>
            <p className="text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              Find groups and events that match your interests and passions
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/groups?category=${category.name}`}
                className="group p-6 bg-white dark:bg-secondary-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Groups Section */}
      <section className="py-16 bg-white dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
                Trending Groups
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300">
                Join the most popular groups in your area
              </p>
            </div>
            <Link
              to="/groups"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-secondary-200 dark:bg-secondary-700 h-48 rounded-lg mb-4"></div>
                  <div className="bg-secondary-200 dark:bg-secondary-700 h-4 rounded mb-2"></div>
                  <div className="bg-secondary-200 dark:bg-secondary-700 h-3 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGroups.map((group) => (
                <Link
                  key={group._id}
                  to={`/groups/${group._id}`}
                  className="group card-hover"
                >
                  <div className="relative mb-4">
                    <img
                      src={group.image || 'https://via.placeholder.com/400x200'}
                      alt={group.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categories.find(c => c.name === group.category)?.color || 'bg-secondary-100 text-secondary-600'}`}>
                        {group.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {group.name}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 line-clamp-2">
                    {group.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{group.city}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{group.memberCount || group.members?.length || 0} members</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
                Upcoming Events
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300">
                Don't miss out on these exciting events
              </p>
            </div>
            <Link
              to="/events"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-secondary-200 dark:bg-secondary-700 h-48 rounded-lg mb-4"></div>
                  <div className="bg-secondary-200 dark:bg-secondary-700 h-4 rounded mb-2"></div>
                  <div className="bg-secondary-200 dark:bg-secondary-700 h-3 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="group card-hover"
                >
                  <div className="relative mb-4">
                    <img
                      src={event.image || 'https://via.placeholder.com/400x200'}
                      alt={event.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categories.find(c => c.name === event.category)?.color || 'bg-secondary-100 text-secondary-600'}`}>
                        {event.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 dark:bg-secondary-800/90 px-2 py-1 rounded text-xs font-semibold text-secondary-900 dark:text-white">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {event.name}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.city}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{event.attendeeCount || event.attendees?.length || 0} attending</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Connecting?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are already building meaningful connections 
            through Coffee Chat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/signup"
                  className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/groups"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Explore Groups
                </Link>
              </>
            ) : (
              <Link
                to="/groups"
                className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Discover Groups
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
