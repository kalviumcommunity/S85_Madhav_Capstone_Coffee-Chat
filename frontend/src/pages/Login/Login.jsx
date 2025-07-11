// src/pages/Login/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Coffee, ArrowRight, Users, Heart } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';
const loginImg ="https://res.cloudinary.com/dfgzjz1by/image/upload/v1751633258/login_xd0wmn.jpg";
import BACKEND_URL from '../../config';

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
      const response = await fetch(`${BACKEND_URL}/api/users/login`, {
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
      console.log('Google ID token:', idToken);
      // Send token to backend
      const response = await fetch(`${BACKEND_URL}/api/users/google-login`, {
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
      console.log('Backend /google-login response:', data);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col md:flex-row pt-20 md:pt-24">
      {/* Left Side - Image with Overlay and Text */}
      <div className="relative w-full md:w-1/2 h-64 md:min-h-screen md:h-auto overflow-hidden flex-shrink-0">
        <img
          src={loginImg}
          alt="Login Visual"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        {/* Feature Badges in a row at bottom left */}
        <div className="hidden sm:flex flex-row gap-4 absolute left-6 bottom-6 z-20">
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
        <div className="absolute top-10 left-10 w-16 h-16 bg-white/10 rounded-full animate-bounce z-10" />
        <div className="absolute bottom-10 right-10 w-12 h-12 bg-white/10 rounded-full animate-bounce z-10" style={{ animationDelay: '1s' }} />
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