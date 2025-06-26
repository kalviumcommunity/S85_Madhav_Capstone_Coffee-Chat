import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Plus, 
  Grid, 
  List,
  Calendar,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const Groups = ({ user, setUser }) => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'popular', 'name'

  const categories = [
    'All', 'Technology', 'Sports', 'Music', 'Art', 'Food', 'Travel', 'Business', 'Education', 'Health', 'Other'
  ];

  const cities = ['All', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    filterAndSortGroups();
  }, [groups, searchQuery, selectedCategory, selectedCity, sortBy]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        toast.error('Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGroups = () => {
    let filtered = [...groups];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(group => group.category === selectedCategory);
    }

    // Filter by city
    if (selectedCity !== 'All') {
      filtered = filtered.filter(group => group.city === selectedCity);
    }

    // Sort groups
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.memberCount || b.members?.length || 0) - (a.memberCount || a.members?.length || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredGroups(filtered);
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) {
      toast.error('Please log in to join groups');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Successfully joined the group!');
        fetchGroups(); // Refresh groups to update member count
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    }
  };

  const GroupCard = ({ group }) => (
    <div className="card-hover group">
      <div className="relative mb-4">
        <img
          src={group.image || 'https://via.placeholder.com/400x200'}
          alt={group.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-600">
            {group.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/90 dark:bg-secondary-800/90 text-secondary-900 dark:text-white">
            {group.privacy}
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
        {group.name}
      </h3>
      
      <p className="text-secondary-600 dark:text-secondary-300 mb-3 line-clamp-2">
        {group.description}
      </p>
      
      <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400 mb-4">
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4" />
          <span>{group.city}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>{group.memberCount || group.members?.length || 0} members</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Link
          to={`/groups/${group._id}`}
          className="flex-1 btn-outline text-center"
        >
          View Details
        </Link>
        <button
          onClick={() => handleJoinGroup(group._id)}
          className="flex-1 btn-primary"
        >
          Join Group
        </button>
      </div>
    </div>
  );

  const GroupListItem = ({ group }) => (
    <div className="card-hover group">
      <div className="flex items-center space-x-4">
        <img
          src={group.image || 'https://via.placeholder.com/80x80'}
          alt={group.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
              {group.name}
            </h3>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-600">
              {group.category}
            </span>
          </div>
          
          <p className="text-secondary-600 dark:text-secondary-300 mb-2 line-clamp-1">
            {group.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{group.city}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{group.memberCount || group.members?.length || 0} members</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link
            to={`/groups/${group._id}`}
            className="btn-outline"
          >
            View Details
          </Link>
          <button
            onClick={() => handleJoinGroup(group._id)}
            className="btn-primary"
          >
            Join Group
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Navbar user={user} setUser={setUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
              Discover Groups
            </h1>
            <p className="text-secondary-600 dark:text-secondary-300">
              Find and join groups that match your interests
            </p>
          </div>
          
          {user && (
            <Link
              to="/groups/create"
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
            >
              <Plus className="w-5 h-5" />
              <span>Create Group</span>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search groups by name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="input-field"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  View
                </label>
                <div className="flex border border-secondary-300 dark:border-secondary-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                    }`}
                  >
                    <Grid className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                    }`}
                  >
                    <List className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-secondary-600 dark:text-secondary-300">
            {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Groups Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                {viewMode === 'grid' ? (
                  <>
                    <div className="bg-secondary-200 dark:bg-secondary-700 h-48 rounded-lg mb-4"></div>
                    <div className="bg-secondary-200 dark:bg-secondary-700 h-4 rounded mb-2"></div>
                    <div className="bg-secondary-200 dark:bg-secondary-700 h-3 rounded w-2/3"></div>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="bg-secondary-200 dark:bg-secondary-700 w-20 h-20 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-secondary-200 dark:bg-secondary-700 h-4 rounded w-1/3"></div>
                      <div className="bg-secondary-200 dark:bg-secondary-700 h-3 rounded w-2/3"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No groups found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-300 mb-6">
              Try adjusting your search criteria or create a new group
            </p>
            {user && (
              <Link to="/groups/create" className="btn-primary">
                Create Your First Group
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredGroups.map(group => (
              viewMode === 'grid' ? (
                <GroupCard key={group._id} group={group} />
              ) : (
                <GroupListItem key={group._id} group={group} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups; 