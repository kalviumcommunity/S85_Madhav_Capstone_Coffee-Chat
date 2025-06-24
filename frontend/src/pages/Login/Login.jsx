// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from '../../firebase';
import './Login.css'; // Custom styles for auth forms

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/users/login', form);
      localStorage.setItem('token', res.data.token);
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

      localStorage.setItem('token', res.data.token);
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
      </form>
    </div>
  );
};

export default Login;
