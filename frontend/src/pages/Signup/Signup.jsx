// src/pages/Signup/Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from '../../firebase';
import './Signup.css';

const Signup = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', location: '', profileImage: ''
  });
  const navigate = useNavigate();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/users/signup', form);
      localStorage.setItem('token', res.data.token);
      navigate('/login');
    } catch (err) {
      alert('Signup failed');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      console.log("📦 Sending token to backend:", idToken);
      const res = await axios.post('http://localhost:3000/api/users/google-login', {
  token: idToken,
  mode: 'signup',
});

      localStorage.setItem('token', res.data.token);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Google Login failed');

    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSignup}>
        <h2 className="auth-title">Create Your Account</h2>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Profile Image URL" value={form.profileImage} onChange={e => setForm({ ...form, profileImage: e.target.value })} />
        <button type="submit" className="btn-primary">Sign Up</button>
        <div className="divider">or</div>
        <button type="button" className="btn-google" onClick={handleGoogleSignup}>
          <img src="https://img.icons8.com/color/16/google-logo.png" alt="G" /> Sign up with Google
        </button>
      </form>
    </div>
  );
};

export default Signup;
