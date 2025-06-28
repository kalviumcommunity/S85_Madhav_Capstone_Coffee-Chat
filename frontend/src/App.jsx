import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './Components/Home/Home';
import Profile from './pages/Profile/Profile';
import Groups from './pages/Groups/Groups';
import GroupDetails from './pages/GroupDetails/GroupDetails';
import CreateGroup from './pages/CreateGroup/CreateGroup';
import Events from './pages/Events/Events';
import CreateEvent from './pages/CreateEvent/CreateEvent';
import EventDetails from './pages/EventDetails/EventDetails';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:3000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={<Home user={user} setUser={setUser} />} 
          />
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/" replace /> : <Login setUser={setUser} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              user ? <Navigate to="/" replace /> : <Signup setUser={setUser} />
            } 
          />
          <Route 
            path="/groups" 
            element={<Groups user={user} setUser={setUser} />} 
          />
          <Route 
            path="/groups/create" 
            element={
              user ? <CreateGroup user={user} setUser={setUser} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/groups/:id" 
            element={<GroupDetails user={user} setUser={setUser} />} 
          />
          <Route 
            path="/events" 
            element={<Events user={user} setUser={setUser} />} 
          />
          <Route 
            path="/events/create" 
            element={
              user ? <CreateEvent user={user} setUser={setUser} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/events/:id" 
            element={<EventDetails user={user} setUser={setUser} />} 
          />
          <Route 
            path="/profile" 
            element={
              user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
