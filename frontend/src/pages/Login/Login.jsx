// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { jwtDecode } from 'jwt-decode'; // ✅ Add this
import app from '../../firebase';
import './Login.css';

const Login = ({ setUser,fetchUserProfile }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

 const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:3000/api/users/login', form);
    const token = res.data.token;

    localStorage.setItem('token', token);
    fetchUserProfile(res.data.token);

    const decoded = jwtDecode(token); // ✅ Decode JWT
    setUser(decoded);                 // ✅ Set user state

    navigate('/');
  } catch (err) {
    alert('Login failed');
  }
};


  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const res = await axios.post('http://localhost:3000/api/users/google-login', {
      token: idToken,
      mode: 'login',
    });

    const token = res.data.token;
    localStorage.setItem('token', token);
    fetchUserProfile(res.data.token);
    const decoded = jwtDecode(token); // ✅ Decode
    setUser(decoded);                 // ✅ Set user

    navigate('/');
  } catch (err) {
    alert(err.response?.data?.message || 'Google Login failed');
  }
};


  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2 className="auth-title">Welcome Back</h2>
        <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" className="btn-primary">Log In</button>
        <div className="divider">or</div>
        <button type="button" className="btn-google" onClick={handleGoogleLogin}>
          <img src="https://img.icons8.com/color/16/google-logo.png" alt="G" /> Log in with Google
        </button>
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
