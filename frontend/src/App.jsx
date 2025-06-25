import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './Components/Home/Home';
import Profile from './pages/Profile/Profile';
import Groups from './pages/Groups/Groups';
import GroupDetails from './pages/GroupDetails/GroupDetails';
// import CreateGroup from './pages/CreateGroup/CreateGroup';
import Events from './pages/Events/Events';
// import CreateEvent from './pages/CreateEvent/CreateEvent';

function App() {
  const [user, setUser] = useState(null);
  
  // 🔁 Centralized profile fetcher
  const fetchUserProfile = (token) => {
    fetch('http://localhost:3000/api/users/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => {
        console.error("Failed to fetch profile:", err);
        localStorage.removeItem('token');
        setUser(null);
      });
  };

  // 🔁 Auto fetch on first load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        jwtDecode(token); // Optional validation
        fetchUserProfile(token); // 👈 Immediately fetch
      } catch (err) {
        console.error('Invalid token');
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} fetchUserProfile={fetchUserProfile} />} />
        <Route path="/signup" element={<Signup setUser={setUser} fetchUserProfile={fetchUserProfile} />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
        <Route path="/groups" element={<Groups user={user} setUser={setUser} />} />
        <Route path="/groups/:id" element={<GroupDetails user={user} setUser={setUser} />} />
        
        <Route path="/events" element={<Events user={user} setUser={setUser} />} />
        
      </Routes>
    </Router>
  );
}

export default App;
