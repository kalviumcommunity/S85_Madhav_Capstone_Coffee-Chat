import React, { useState, useEffect, useRef } from 'react';
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
  Star,
  Bookmark,
  Share2,
  Lock,
  Unlock,
  ArrowRight,
  Eye,
  Heart,
  TrendingUp,
  Coffee
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Groups.css';
import BACKEND_URL from '../../config';

  const CAROUSEL_IMAGES = ["https://res.cloudinary.com/dfgzjz1by/image/upload/v1751632079/michael-mckay-WyqSZPGxNLo-unsplash_b8eyuk.jpg",
    "https://res.cloudinary.com/dfgzjz1by/image/upload/v1751632078/mike-kilcoyne-WhvVTv4Hif8-unsplash_k2l255.jpg",
    "https://res.cloudinary.com/dfgzjz1by/image/upload/v1751632079/pexels-photo-5195502_vdygis.jpg",
    "https://res.cloudinary.com/dfgzjz1by/image/upload/v1751632078/kelsey-chance-ZrhtQyGFG6s-unsplash_nkaomm.jpg",
    "https://res.cloudinary.com/dfgzjz1by/image/upload/v1751632078/cole-allen-Lqv3cjyTMS8-unsplash_z15y2f.jpg",
    "https://res.cloudinary.com/dfgzjz1by/image/upload/v1751632078/clay-lindner-upEBfR0r_T4-unsplash_fazikk.jpg"
  ];
<style>{`
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
@keyframes fadeSlideIn {
  0% { opacity: 0; transform: translateX(60px); }
  100% { opacity: 1; transform: translateX(0); }
}
.image-stack-glass {
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(14px);
  border-radius: 1.5rem;
  padding: 2rem 1.5rem;
  max-width: 320px;
  margin-right: 0;
  box-shadow: 0 8px 32px rgba(255, 171, 54, 0.08), 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
}
@media (max-width: 768px) {
  .image-stack-glass { max-width: 100%; margin: 2rem 0 0 0; padding: 1.2rem; }
}
.image-card {
  width: 100%;
  height: auto;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  opacity: 0;
  animation: fadeSlideIn 0.8s cubic-bezier(.4,0,.2,1) forwards, float 4s ease-in-out infinite;
  transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s cubic-bezier(.4,0,.2,1);
}
.image-card:hover {
  transform: scale(1.06);
  box-shadow: 0 12px 30px rgba(255, 171, 54, 0.45), 0 10px 25px rgba(0,0,0,0.15);
  z-index: 2;
}
`}</style>


function VerticalCarousel() {
  const [images, setImages] = useState(CAROUSEL_IMAGES);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const imageHeight = 170;
  const visibleCount = 3;
  const containerHeight = imageHeight * visibleCount;
  const listRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitionEnabled(true);
      setIsAnimating(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle the end of the transition for seamless looping
  useEffect(() => {
    const handleTransitionEnd = () => {
      setTransitionEnabled(false); // Disable transition for instant reset
      setIsAnimating(false); // Instantly reset transform
      setImages(imgs => {
        const next = [...imgs];
        next.push(next.shift());
        return next;
      });
      // Allow the DOM to update before re-enabling transition
      setTimeout(() => {
        setTransitionEnabled(true);
      }, 30);
    };
    const node = listRef.current;
    if (node) {
      node.addEventListener('transitionend', handleTransitionEnd);
    }
    return () => {
      if (node) node.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, []);

  return (
    <div className="image-stack-glass" style={{
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(12px)',
      borderRadius: '1.5rem',
      maxWidth: 360,
      width: '100%',
      overflow: 'hidden',
      height: containerHeight,
      boxShadow: '0 8px 32px rgba(255, 171, 54, 0.08), 0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: 0
    }}>
      <div
        ref={listRef}
        style={{
          display: 'flex', flexDirection: 'column',
          transition: transitionEnabled ? 'transform 0.8s cubic-bezier(.4,0,.2,1)' : 'none',
          transform: isAnimating ? `translateY(-${imageHeight}px)` : 'translateY(0)'
        }}
      >
        {images.slice(0, visibleCount + 1).map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`Group ${i+1}`}
            style={{
              width: '100%',
              height: `${imageHeight}px`,
              objectFit: 'cover',
              borderRadius: '1.2rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              marginBottom: i < visibleCount ? '1.2rem' : 0,
              transition: 'transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1)',
              cursor: 'pointer',
              background: '#FFF0E0',
            }}
            className="carousel-image"
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.07)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 171, 54, 0.45), 0 10px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
            }}
          />
        ))}
      </div>
    </div>
  );
}

const Groups = ({ user, setUser, groups, setGroups }) => {
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
      const response = await fetch(`${BACKEND_URL}/api/groups`);
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
      const response = await fetch(`${BACKEND_URL}/api/groups/${groupId}/join`, {
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

  const handleShare = async (group) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: group.name,
          text: group.description,
          url: `${window.location.origin}/groups/${group._id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/groups/${group._id}`;
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Group link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  const handleBookmark = async (groupId, isBookmarkedOverride) => {
    if (!user) {
      toast.error('Please log in to bookmark groups');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/groups/${groupId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(prev => prev.map(group => 
          group._id === groupId 
            ? { ...group, isBookmarked: data.isBookmarked }
            : group
        ));
        if (typeof isBookmarkedOverride === 'function') {
          isBookmarkedOverride(data.isBookmarked);
        }
        toast.success(data.isBookmarked ? 'Group bookmarked!' : 'Group removed from bookmarks');
      } else {
        toast.error('Failed to bookmark group');
      }
    } catch (error) {
      console.error('Error bookmarking group:', error);
      toast.error('Failed to bookmark group');
    }
  };

  const GroupCard = ({ group, onBookmarkSync }) => {
    const isMember = group.isMember || group.members?.some(member => member._id === user?._id);
    const isBookmarked = group.isBookmarked || user?.bookmarkedGroups?.includes(group._id);
    const memberCount = group.memberCount || group.members?.length || 0;
    
    return (
      <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-white/20 overflow-hidden">
        <div className="relative">
          <img
            src={group.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
            alt={group.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          
          {/* Top-left badges */}
          <div className="absolute top-4 left-4 flex space-x-2">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm shadow-lg backdrop-blur-sm">
              {group.category}
            </span>
          </div>

          {/* Top-right badges */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {/* Privacy Badge */}
            <span className={`px-3 py-1 rounded-full font-semibold text-sm shadow-lg backdrop-blur-sm ${
              group.privacy === 'Public' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {group.privacy === 'Public' ? <Unlock className="w-4 h-4 inline mr-1" /> : <Lock className="w-4 h-4 inline mr-1" />}
              {group.privacy}
            </span>
            
            {/* Bookmark Button */}
            <button
              onClick={() => handleBookmark(group._id, onBookmarkSync)}
              className={`p-2 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${
                isBookmarked 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-white/90 text-gray-600 hover:text-orange-600 hover:bg-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
            {group.name}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {group.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{group.city}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4 text-orange-500" />
              <span>{memberCount} members</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Join/Leave Button */}
          {!isMember ? (
            <button
              onClick={() => handleJoinGroup(group._id)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Join Group</span>
            </button>
          ) : (
            <button
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg cursor-default flex items-center justify-center space-x-2"
              disabled
            >
              <Heart className="w-5 h-5" />
              <span>Joined ✓</span>
            </button>
          )}

          {/* Action Links */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Link
              to={`/groups/${group._id}`}
              className="text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors duration-200 flex items-center space-x-1 group/link"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => handleShare(group)}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors duration-200 flex items-center space-x-1"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const GroupListCard = ({ group }) => {
    console.log('Group image:', group.image); // Debug log
    const isMember = group.isMember || group.members?.some(member => member._id === user?._id);
    const isBookmarked = group.isBookmarked || user?.bookmarkedGroups?.includes(group._id);
    const memberCount = group.memberCount || group.members?.length || 0;

    return (
      <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 w-full">
        <div className="flex items-center space-x-6">
          {/* Image */}
          <div className="relative flex-shrink-0" style={{ minWidth: 96, minHeight: 96 }}>
            <img
              src={group.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
              alt={group.name}
              className="w-24 h-24 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 bg-gray-200"
              onError={e => { e.target.src = 'https://via.placeholder.com/96x96?text=No+Image'; }}
              style={{ display: 'block' }}
            />
          </div>
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                {group.name}
              </h3>
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm shadow-sm">
                {group.category}
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{group.city}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-500" />
                <span>{memberCount} members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${group.privacy === 'Public' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{group.privacy}</span>
            </div>
            <div className="flex gap-3">
              {!isMember ? (
                <button
                  onClick={() => handleJoinGroup(group._id)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Users className="w-5 h-5" />
                  <span>Join</span>
                </button>
              ) : (
                <button
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg cursor-default flex items-center space-x-2"
                  disabled
                >
                  <Heart className="w-5 h-5" />
                  <span>Joined ✓</span>
                </button>
              )}
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleBookmark(group._id)}
              className={`p-3 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${
                isBookmarked 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-white/90 text-gray-600 hover:text-orange-600 hover:bg-white'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => handleShare(group)}
              className="p-3 rounded-full bg-white/90 text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <Link
              to={`/groups/${group._id}`}
              className="text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors duration-200 flex items-center space-x-1 group/link"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="group-page-wrapper">
      <div className="mesh-light" />
      <Navbar user={user} setUser={setUser} />
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 lg:px-16 py-16 md:py-24 animate-soft-zoom">
        <div className="flex-1 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2E2E2E] mb-6 leading-tight drop-shadow-xl">Connect Over Coffee. Grow Through Conversations.</h1>
          <p className="text-lg md:text-2xl text-[#2E2E2E]/80 mb-8 max-w-xl">Discover curated interest-based groups where meaningful connections begin.<br/>Your next great conversation is just one group away.</p>
        </div>
        <div className="flex-1 flex items-center justify-center relative min-h-[440px] mt-10 md:mt-0">
          <VerticalCarousel />
        </div>
      </section>
      {/* Header and Create Group Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2E2E2E] mb-2">Discover Groups</h2>
          <p className="text-lg text-[#2E2E2E]/80">Find and join groups that match your interests</p>
        </div>
        {user && (
          <Link
            to="/groups/create"
            className="relative text-white font-semibold py-2.5 px-7 rounded-2xl shadow-xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-orange-200/60 focus:ring-4 focus:ring-orange-300 focus:outline-none transition-all duration-300 flex items-center gap-2 mt-4 sm:mt-0 group"
            style={{
              fontSize: '1.08rem',
              letterSpacing: '0.01em',
              background: 'linear-gradient(90deg, #FF7A1A 0%, #FFAB36 100%)',
              boxShadow: '0 2px 16px 0 rgba(255,171,54,0.10)'
            }}
          >
            <Plus className="w-6 h-6" />
            <span>Create Group</span>
            <span className="absolute inset-0 rounded-2xl pointer-events-none group-hover:shadow-[0_0_18px_4px_#FFAB36] transition-all duration-300" style={{ boxShadow: 'none' }}></span>
          </Link>
        )}
      </div>
      {/* Sticky Search & Filter Bar */}
      <div className="sticky top-20 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-slide-up">
        <div className="glass-card-light rounded-2xl shadow-2xl border border-white/30 p-3 mb-6 flex flex-col md:flex-row gap-2 items-center relative" style={{backdropFilter:'blur(16px)', background:'rgba(255,255,255,0.12)', boxShadow:'0 8px 32px rgba(255,171,54,0.08), 0 2px 8px rgba(0,0,0,0.04)'}}>
          {/* Category Dropdown */}
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-3 py-2 rounded-xl bg-white/20 shadow focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all duration-300 text-base font-medium">
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
          {/* City Dropdown */}
          <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="px-3 py-2 rounded-xl bg-white/20 shadow focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all duration-300 text-base font-medium">
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          {/* Search Input */}
          <div className="flex-1 w-full flex items-center bg-white/20 rounded-xl shadow px-3 py-2 focus-within:ring-2 focus-within:ring-orange-400 transition-all duration-300 min-w-[180px]">
            <Search className="w-5 h-5 text-orange-400 mr-2" />
            <input type="text" placeholder="Search groups..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-base focus:outline-none" />
          </div>
          {/* Sort Dropdown */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-xl bg-white/20 shadow focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all duration-300 text-base font-medium">
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="name">Name A-Z</option>
          </select>
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 ml-1">
            <button
              aria-label="Grid view"
              className={`p-2 rounded-xl border-2 transition-all duration-200 ${viewMode === 'grid' ? 'bg-orange-100 border-orange-400 text-orange-600 shadow' : 'bg-white/20 border-white/40 text-gray-400 hover:bg-orange-50 hover:text-orange-500'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              aria-label="List view"
              className={`p-2 rounded-xl border-2 transition-all duration-200 ${viewMode === 'list' ? 'bg-orange-100 border-orange-400 text-orange-600 shadow' : 'bg-white/20 border-white/40 text-gray-400 hover:bg-orange-50 hover:text-orange-500'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Group Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{background: 'transparent'}}>
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {/* Premium right-aligned Create Group button */}
            {user && (
              <div className="flex justify-end mb-4">
                <Link
                  to="/groups/create"
                  className="gradient-premium-orange text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  style={{ fontSize: '1.08rem', letterSpacing: '0.01em' }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Group</span>
                </Link>
              </div>
            )}
            {loading ? (
              [...Array(6)].map((_, i) => <div key={i} className="h-32 bg-white/60 rounded-2xl shadow animate-pulse" />)
            ) : filteredGroups.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Users className="w-12 h-12 mx-auto text-orange-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No groups found</h3>
                <p className="text-gray-600 mb-8 text-lg">Try adjusting your search or create a new group</p>
                {user && <Link to="/groups/create" className="gradient-premium-orange text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"><Plus className="w-5 h-5" /><span>Create Your First Group</span></Link>}
              </div>
            ) : (
              filteredGroups.map((group) => <GroupListCard key={group._id} group={group} />)
            )}
          </div>
        ) : (
          loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white/60 rounded-2xl shadow animate-pulse"></div>)
          ) : filteredGroups.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Users className="w-12 h-12 mx-auto text-orange-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No groups found</h3>
              <p className="text-gray-600 mb-8 text-lg">Try adjusting your search or create a new group</p>
              {user && <Link to="/groups/create" className="gradient-premium-orange text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"><Plus className="w-5 h-5" /><span>Create Your First Group</span></Link>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGroups.map((group, idx) => (
                <div key={group._id} className="glass-card rounded-2xl shadow-xl p-0 overflow-hidden animate-fade-slide-up" style={{ animationDelay: `${0.1 + idx * 0.07}s` }}>
                  <GroupCard group={group} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
      {/* CTA Motivation Box */}
      <section className="max-w-3xl mx-auto my-16 px-6 py-12 rounded-3xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #FFE2BA, #FFD2A1)' }}>
        <div className="flex flex-col items-center text-center gap-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E] mb-2">Can't find the right group? Start one and bring like-minded people together.</h2>
          <p className="text-lg text-[#2E2E2E]/80 mb-4">Build a space around your passion — it's easier than you think.<br/>Be the reason someone feels connected.</p>
          <Link to="/groups/create" className="gradient-premium-orange text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mt-2">
            <Plus className="w-5 h-5" />
            <span>Create Group</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Groups; 