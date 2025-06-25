import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from '../../firebase';
import './Signup.css';

const Signup = ({ setUser,fetchUserProfile }) => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', location: ''
  });
  const [imageFile, setImageFile] = useState(null); // <-- NEW
  const navigate = useNavigate();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

const handleSignup = async (e) => {
  e.preventDefault();

  let profileImageUrl = '';

  // 1. Upload to Cloudinary if image is selected
  if (imageFile) {
    const imageData = new FormData();
    imageData.append('file', imageFile);
    imageData.append('upload_preset', 'coffee chat');  // 🔁 Replace this
    imageData.append('cloud_name', 'dfgzjz1by');        // 🔁 Replace this

    try {
      const cloudinaryRes = await axios.post(
        'https://api.cloudinary.com/v1_1/dfgzjz1by/image/upload',
        imageData
      );
      profileImageUrl = cloudinaryRes.data.secure_url;
    } catch (err) {
      alert("Image upload failed");
      return;
    }
  }

  // 2. Send to your backend
  try {
    const res = await axios.post('http://localhost:3000/api/users/signup', {
      ...form,
      profileImage: profileImageUrl || '',  // empty if not uploaded
    });

    localStorage.setItem('token', res.data.token);
    fetchUserProfile(res.data.token);
    navigate('/login');
  } catch (err) {
    alert('Signup failed');
  }
};


  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post('http://localhost:3000/api/users/google-login', {
        token: idToken,
        mode: 'signup',
      });

      localStorage.setItem('token', res.data.token);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Google Signup failed');
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
        
        {/* 👇 New file input */}
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />

        <button type="submit" className="btn-primary">Sign Up</button>
        <div className="divider">or</div>
        <button type="button" className="btn-google" onClick={handleGoogleSignup}>
          <img src="https://img.icons8.com/color/16/google-logo.png" alt="G" /> Sign up with Google
        </button>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
