import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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

  // Function to refresh backend token using Firebase token
  const refreshBackendToken = async (firebaseUser) => {
    try {
      const firebaseToken = await firebaseUser.getIdToken(true);
      console.log('[App] Refreshing backend token with Firebase token...');
      
      const response = await fetch('http://localhost:3000/api/users/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: firebaseToken,
          mode: 'login'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        console.log('[App] Backend token refreshed successfully');
        return data.user;
      } else {
        console.error('[App] Failed to refresh backend token:', response.status);
        return null;
      }
    } catch (error) {
      console.error('[App] Error refreshing backend token:', error);
      return null;
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true);
          console.log('[App] Firebase user authenticated:', firebaseUser.email);
          
          // Fetch backend user profile
          const backendToken = localStorage.getItem('token');
          if (backendToken) {
            try {
              console.log('[App] Backend token found, fetching profile...');
              const response = await fetch('http://localhost:3000/api/users/profile', {
                headers: {
                  'Authorization': `Bearer ${backendToken}`
                }
              });
              
              if (response.ok) {
                const backendUser = await response.json();
                console.log('[App] Backend user profile loaded:', backendUser.name);
                setUser(backendUser);
              } else if (response.status === 401) {
                console.error('[App] Backend token expired or invalid, attempting to refresh...');
                localStorage.removeItem('token');
                
                // Try to refresh the backend token
                const refreshedUser = await refreshBackendToken(firebaseUser);
                if (refreshedUser) {
                  console.log('[App] Backend token refreshed, user profile loaded:', refreshedUser.name);
                  setUser(refreshedUser);
                } else {
                  console.log('[App] Failed to refresh backend token, using Firebase user');
                  setUser(firebaseUser);
                }
              } else {
                console.error('[App] Failed to load backend profile:', response.status);
                // Fallback to Firebase user if backend profile fails
                setUser(firebaseUser);
              }
            } catch (error) {
              console.error('[App] Error loading backend profile:', error);
              // Fallback to Firebase user if backend profile fails
              setUser(firebaseUser);
            }
          } else {
            console.log('[App] No backend token found, using Firebase user');
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error('[App] Error getting Firebase token:', error);
          setUser(null);
        }
      } else {
        console.log('[App] No Firebase user, clearing user state');
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
