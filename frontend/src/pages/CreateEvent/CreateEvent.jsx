import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Image as ImageIcon, 
  Clock, 
  Users,
  Lock,
  Unlock,
  Tag,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Mic,
  Music,
  Camera,
  Star,
  Laptop,
  Dumbbell,
  Palette,
  Pizza,
  Plane,
  Briefcase,
  Book,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import './CreateEvent.css';

const CreateEvent = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Technology',
    city: '',
    date: '',
    startTime: '',
    endTime: '',
    image: '',
    isPublic: true,
    rsvpLimit: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const [imageProcessing, setImageProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
    { name: 'Technology', icon: <Laptop className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-blue-100 text-blue-700' },
    { name: 'Sports', icon: <Dumbbell className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-green-100 text-green-700' },
    { name: 'Music', icon: <Music className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-purple-100 text-purple-700' },
    { name: 'Art', icon: <Palette className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-pink-100 text-pink-700' },
    { name: 'Food', icon: <Pizza className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-orange-100 text-orange-700' },
    { name: 'Travel', icon: <Plane className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Business', icon: <Briefcase className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-gray-100 text-gray-700' },
    { name: 'Education', icon: <Book className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Health', icon: <Heart className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-red-100 text-red-700' },
    { name: 'Social', icon: <Users className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-teal-100 text-teal-700' },
    { name: 'Other', icon: <Star className="w-5 h-5 md:w-6 md:h-6" />, color: 'bg-gray-100 text-gray-700' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality 0.8 (80%)
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (file) => {
    if (file) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('Image file is too large. Please select an image smaller than 5MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (PNG, JPG, JPEG, GIF)');
        return;
      }

      try {
        // Show loading state
        setLoading(true);
        setImageProcessing(true);
        
        // Compress the image
        const compressedBlob = await compressImage(file);
        
        // Check if compressed size is still too large
        if (compressedBlob.size > maxSize) {
          toast.error('Image is still too large after compression. Please try a smaller image.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
          setFormData(prev => ({ ...prev, image: e.target.result }));
        };
        reader.onerror = () => {
          toast.error('Error reading image file. Please try again.');
        };
        reader.readAsDataURL(compressedBlob);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Error processing image. Please try again.');
      } finally {
        setLoading(false);
        setImageProcessing(false);
      }
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || !formData.city || !formData.date || !formData.image) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Please set both start and end time');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.startTime}`);
      
      const eventData = {
        ...formData,
        date: eventDateTime.toISOString(),
        time: {
          start: formData.startTime,
          end: formData.endTime
        }
      };

      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        if (response.status === 413) {
          toast.error('Image file is too large. Please use a smaller image (under 5MB).');
        } else if (response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          navigate('/login');
        } else if (response.status === 403) {
          toast.error('You do not have permission to create events.');
        } else {
          // Try to get error message from response
          let errorMessage = 'Failed to create event';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
          toast.error(errorMessage);
        }
        return;
      }

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Event created successfully!');
        navigate(`/events`);
      } else {
        toast.error(data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.name === 'SyntaxError') {
        toast.error('Server returned an invalid response. Please try again.');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to create event. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    return categories.find(cat => cat.name === categoryName)?.icon || <Star className="w-5 h-5 md:w-6 md:h-6" />;
  };

  const getCategoryColor = (categoryName) => {
    return categories.find(cat => cat.name === categoryName)?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-yellow-50">
      <Navbar user={user} setUser={setUser} />
      
      <div className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Creating your event...</span>
              <span className="text-sm font-medium text-orange-600">{currentStep}/4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Illustration */}
            <div className="lg:hidden mb-8">
              <div className="relative">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-4 left-12 w-48 h-48 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                
                {/* Illustration */}
                <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Host Amazing Events</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Create unforgettable experiences that bring people together. 
                      From meetups to workshops, your event will inspire connections and create lasting memories.
                    </p>
                    
                    {/* Feature Highlights */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-xs text-gray-700">Easy RSVP management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-xs text-gray-700">Built-in attendee tracking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <Mic className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="text-xs text-gray-700">Event chat and updates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Illustration */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <div className="relative">
                  {/* Background Blobs */}
                  <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                  <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                  
                  {/* Illustration */}
                  <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Calendar className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Host Amazing Events</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Create unforgettable experiences that bring people together. 
                        From meetups to workshops, your event will inspire connections and create lasting memories.
                      </p>
                      
                      {/* Feature Highlights */}
                      <div className="mt-8 space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700">Easy RSVP management</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700">Built-in attendee tracking</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Mic className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-700">Event chat and updates</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              {/* Header */}
              <div className="flex items-center space-x-4 mb-8">
                <button
                  onClick={() => navigate('/events')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Create New Event
                  </h1>
                  <p className="text-gray-600">
                    Organize an event and bring people together
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Name */}
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter event name"
                    required
                    onFocus={() => setCurrentStep(1)}
                  />
                </div>

                {/* Description */}
                <div className="group">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 placeholder-gray-400 resize-none"
                    placeholder="Describe what your event is about..."
                    required
                    onFocus={() => setCurrentStep(1)}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {formData.description.length}/500 characters
                    </span>
                    {formData.description.length > 450 && (
                      <span className="text-xs text-orange-600">
                        {500 - formData.description.length} characters left
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Category *
                  </label>
                  <div className="grid grid-cols-4 gap-2 md:gap-3">
                    {categories.map(category => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: category.name }));
                          setCurrentStep(2);
                        }}
                        className={`p-2 md:p-2.5 rounded-lg border-2 transition-all duration-200 text-left text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2 ${
                          formData.category === category.name
                            ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-100'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{ minWidth: 0 }}
                      >
                        <span className="text-lg md:text-xl">{category.icon}</span>
                        <span className="font-medium text-gray-700 truncate">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div className="group">
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    City *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 placeholder-gray-400"
                      placeholder="Enter city"
                      required
                      onFocus={() => setCurrentStep(2)}
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Date & Time *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                        required
                        onFocus={() => setCurrentStep(3)}
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                        required
                        onFocus={() => setCurrentStep(3)}
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                        required
                        onFocus={() => setCurrentStep(3)}
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Privacy Settings
                  </label>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, isPublic: true }));
                        setCurrentStep(2);
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        formData.isPublic
                          ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Unlock className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-700">Public Event</div>
                          <div className="text-sm text-gray-500">Anyone can find and join</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, isPublic: false }));
                        setCurrentStep(2);
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        !formData.isPublic
                          ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-medium text-gray-700">Private Event</div>
                          <div className="text-sm text-gray-500">Only invited people can join</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* RSVP Limit */}
                <div className="group">
                  <label htmlFor="rsvpLimit" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    RSVP Limit (Optional)
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="rsvpLimit"
                      name="rsvpLimit"
                      value={formData.rsvpLimit}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 placeholder-gray-400"
                      placeholder="Maximum number of attendees"
                      min="1"
                      onFocus={() => setCurrentStep(3)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for unlimited attendees
                  </p>
                </div>

                {/* Tags */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Tags (Optional)
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 placeholder-gray-400"
                        placeholder="Add a tag..."
                        maxLength={20}
                      />
                      <button
                        type="button"
                        onClick={handleTagAdd}
                        disabled={!tagInput.trim() || formData.tags.length >= 5}
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Add
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tag)}
                              className="ml-1 hover:text-orange-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.tags.length}/5 tags • Press Enter to add
                    </p>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Event Banner Image *
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                      isDragOver
                        ? 'border-orange-500 bg-orange-50'
                        : imagePreview
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                  >
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg mx-auto shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                          {imageProcessing ? (
                            <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Upload className="w-8 h-8 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            {imageProcessing ? 'Processing image...' : (
                              <>
                                Drag and drop an image here, or{' '}
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="text-orange-600 hover:text-orange-700 font-medium"
                                >
                                  browse
                                </button>
                              </>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, JPEG, GIF • Max 5MB • Auto-compressed
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                    <span>{loading ? 'Creating Event...' : 'Create Event'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/events')}
                    className="w-full mt-3 text-gray-600 hover:text-gray-800 font-medium py-3 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent; 