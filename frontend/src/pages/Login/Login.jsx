// src/pages/Login/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Coffee, ArrowRight, Users, Heart } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';
import loginImg from '../../assets/login.jpg';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
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

  const validateForm = () => {
    const newErrors = {};
    
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        toast.success('Welcome back!');
        navigate('/');
      } else {
        setErrors({ general: data.error || 'Login failed' });
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please try again.' });
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Get the ID token
      const idToken = await user.getIdToken();
      
      // Send token to backend
      const response = await fetch('http://localhost:3000/api/users/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: idToken,
          mode: 'login'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        toast.success('Welcome back!');
        navigate('/');
      } else {
        toast.error(data.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex pt-20 md:pt-24">
      {/* Left Side - Image Section */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-orange-500/10 to-orange-400/20"></div>
        <img
          src={loginImg}
          alt="Login to Coffee Chat - people connecting over coffee"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ minHeight: '100%', minWidth: '100%', filter: 'brightness(0.96) saturate(1.08)', boxShadow: '0 12px 48px 0 rgba(255,171,54,0.13)' }}
        />
        <div className="relative w-full h-full flex items-center justify-center" style={{paddingTop: '6.5rem'}}>
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-center text-white px-12">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <Coffee className="w-6 h-6" />
                <span className="font-medium">Welcome to Coffee Chat</span>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Connect Over
              <span className="block text-orange-200 mt-2">Coffee & Conversations</span>
            </h1>
            
            <p className="text-xl text-orange-100 mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of people who are already building meaningful connections through shared interests and passions.
            </p>
            
            {/* Feature Icons */}
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm text-orange-100">Join Groups</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6" />
                </div>
                <p className="text-sm text-orange-100">Make Friends</p>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src="/Main Logo.png" alt="Coffee Chat Main Logo" className="h-16 w-auto drop-shadow-lg bg-white/80 rounded-2xl p-2" style={{maxWidth: '120px'}} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome back
            </h2>
            <p className="text-lg text-gray-600">
              Join Coffee Chat and connect with people who share your interests
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
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

              {/* Password Field */}
              <div className="relative">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-4 rounded-xl hover:bg-orange-600 transition-all duration-300"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Google Login Button */}
            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleLogin}
              className="w-full bg-white text-orange-500 py-4 rounded-xl hover:bg-orange-100 transition-all duration-300 mt-4"
            >
              {googleLoading ? 'Logging in with Google...' : 'Login with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;