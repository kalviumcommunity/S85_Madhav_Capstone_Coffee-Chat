import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, MapPin, AlertCircle, Check, Coffee, ArrowRight, Users, Heart, Upload, Camera } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';
import signupImg from '../../assets/signup.jpg';
import BACKEND_URL from '../../config';

const Signup = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('location', formData.location);
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        const userWithImage = { ...data.user, profileImage: data.user.profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png' };
        setUser(userWithImage);
        toast.success('Welcome to Coffee Chat!');
        navigate('/');
      } else {
        setErrors({ general: data.error || 'Signup failed' });
        toast.error(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Network error. Please try again.' });
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Get the ID token
      const idToken = await user.getIdToken();
      
      // Send token to backend
      const response = await fetch(`${BACKEND_URL}/api/users/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: idToken,
          mode: 'signup'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        const userWithImage = { ...data.user, profileImage: data.user.profileImage || 'https://cdn-icons-png.flaticon.com/128/847/847969.png' };
        setUser(userWithImage);
        toast.success('Welcome to Coffee Chat!');
        navigate('/');
      } else {
        toast.error(data.error || 'Google signup failed');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error('Google signup failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!formData.password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (formData.password.length >= 6) score++;
    if (formData.password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(formData.password)) score++;
    if (/(?=.*[A-Z])/.test(formData.password)) score++;
    if (/(?=.*\d)/.test(formData.password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      score: Math.min(score, 4),
      label: labels[Math.min(score - 1, 4)] || '',
      color: colors[Math.min(score - 1, 4)] || ''
    };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-orange-50 via-white to-orange-100 flex pt-10 md:pt-16">
      {/* Left Side - Image Section */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <img
          src={signupImg}
          alt="Sign up for Coffee Chat - diverse people connecting over coffee"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ minHeight: '100%', minWidth: '100%', filter: 'brightness(0.8) saturate(1.08)', boxShadow: '0 12px 48px 0 rgba(255,171,54,0.13)' }}
        />
        {/* Slightly lighter overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />
        {/* Feature Badges at bottom left */}
        <div className="hidden sm:flex flex-row gap-4 absolute left-8 bottom-8 z-20">
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-5 py-3 shadow-lg">
            <Users className="w-6 h-6 text-white" />
            <span className="text-white font-medium text-base">Join Groups</span>
          </div>
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-5 py-3 shadow-lg">
            <Heart className="w-6 h-6 text-white" />
            <span className="text-white font-medium text-base">Make Friends</span>
          </div>
        </div>
        {/* Animated Floating Blobs */}
        <div className="absolute top-16 left-16 w-16 h-16 bg-white/10 rounded-full animate-bounce z-10" />
        <div className="absolute bottom-16 right-16 w-12 h-12 bg-white/10 rounded-full animate-bounce z-10" style={{ animationDelay: '1s' }} />
      </div>

      {/* Right Side - Form Section */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src="/Main Logo.png" alt="Coffee Chat Main Logo" className="h-16 w-auto drop-shadow-lg bg-white/80 rounded-2xl p-2" style={{maxWidth: '120px'}} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Create your account
            </h2>
            <p className="text-lg text-gray-600">
              Join Coffee Chat and connect with people who share your interests
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">
                    {errors.general}
                  </span>
                </div>
              )}

              {/* Profile Picture Upload */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-200 bg-gray-100">
                    {imagePreview ? (
                      <img 
                        src={imagePreview}
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={'https://cdn-icons-png.flaticon.com/128/847/847969.png'} 
                        alt="Default profile" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
                    <Upload className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">Upload profile picture (optional)</p>
              </div>

              {/* Name Field */}
              <div className="relative">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      errors.name ? 'border-red-300' : 'border-gray-200 hover:border-orange-300'
                    }`}
                    placeholder=""
                  />
                  <label 
                    htmlFor="name" 
                    className={`absolute left-12 top-1/2 transform -translate-y-1/2 transition-all duration-300 pointer-events-none z-20 ${
                      formData.name ? 'text-xs text-orange-600 -translate-y-6 bg-white px-2 rounded' : 'text-gray-500'
                    }`}
                  >
                    Full name
                  </label>
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="relative">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      errors.email ? 'border-red-300' : 'border-gray-200 hover:border-orange-300'
                    }`}
                    placeholder=""
                  />
                  <label 
                    htmlFor="email" 
                    className={`absolute left-12 top-1/2 transform -translate-y-1/2 transition-all duration-300 pointer-events-none z-20 ${
                      formData.email ? 'text-xs text-orange-600 -translate-y-6 bg-white px-2 rounded' : 'text-gray-500'
                    }`}
                  >
                    Email address
                  </label>
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Location Field */}
              <div className="relative">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="location"
                    name="location"
                    type="text"
                    autoComplete="off"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border-2 border-gray-200 hover:border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder=""
                  />
                  <label 
                    htmlFor="location" 
                    className={`absolute left-12 top-1/2 transform -translate-y-1/2 transition-all duration-300 pointer-events-none z-20 ${
                      formData.location ? 'text-xs text-orange-600 -translate-y-6 bg-white px-2 rounded' : 'text-gray-500'
                    }`}
                  >
                    City (optional)
                  </label>
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      errors.password ? 'border-red-300' : 'border-gray-200 hover:border-orange-300'
                    }`}
                    placeholder=""
                  />
                  <label 
                    htmlFor="password" 
                    className={`absolute left-12 top-1/2 transform -translate-y-1/2 transition-all duration-300 pointer-events-none z-20 ${
                      formData.password ? 'text-xs text-orange-600 -translate-y-6 bg-white px-2 rounded' : 'text-gray-500'
                    }`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= strength.score + 1 ? strength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Password strength: <span className="font-medium">{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-200 hover:border-orange-300'
                    }`}
                    placeholder=""
                  />
                  <label 
                    htmlFor="confirmPassword" 
                    className={`absolute left-12 top-1/2 transform -translate-y-1/2 transition-all duration-300 pointer-events-none z-20 ${
                      formData.confirmPassword ? 'text-xs text-orange-600 -translate-y-6 bg-white px-2 rounded' : 'text-gray-500'
                    }`}
                  >
                    Confirm password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    agreedToTerms 
                      ? 'bg-orange-500 border-orange-500' 
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                >
                  {agreedToTerms && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-orange-600 hover:text-orange-700 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-orange-600 hover:text-orange-700 underline">
                      Privacy Policy
                    </Link>
                  </p>
                  {errors.terms && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.terms}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Signup Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 font-medium"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>{googleLoading ? 'Creating account...' : 'Sign up with Google'}</span>
              </button>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-orange-600 hover:text-orange-700 underline decoration-orange-300 hover:decoration-orange-600 transition-all duration-300"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © 2025 Coffee Chat · <Link to="/terms" className="text-orange-600 hover:text-orange-700 underline">Terms of Service</Link> · <Link to="/privacy" className="text-orange-600 hover:text-orange-700 underline">Privacy Policy</Link> · <Link to="/contact" className="text-orange-600 hover:text-orange-700 underline">Contact</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
