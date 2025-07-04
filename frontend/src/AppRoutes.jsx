import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
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
import Navbar from './Components/Navbar/Navbar';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import SearchResults from './pages/SearchResults/SearchResults';

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  // Check for existing JWT token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const response = await fetch('http://localhost:3000/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        // No token, check Firebase auth
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // User is logged in with Firebase, but we need to get JWT token
            try {
              const idToken = await firebaseUser.getIdToken();
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

              if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                setUser(data.user);
              } else {
                // Firebase user but no backend account, sign out
                await signOut(auth);
                setUser(null);
              }
            } catch (error) {
              console.error('Error syncing Firebase auth:', error);
              await signOut(auth);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // 1. Call backend logout endpoint
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch('http://localhost:3000/api/users/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error('Backend logout error:', error);
        }
      }
      
      // 2. Sign out from Firebase
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Firebase signout error:', error);
    }
    
    // 3. Clear JWT token
    localStorage.removeItem('token');
    
    // 4. Clear any other stored data
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // 5. Clear user state
    setUser(null);
    
    // 6. Force a page reload to clear any cached state
    window.location.href = '/';
  }, []);

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
    <>
      <Navbar user={user} onLogout={handleLogout} />
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
            element={<Groups user={user} setUser={setUser} groups={groups} setGroups={setGroups} />} 
          />
          <Route 
            path="/groups/create" 
            element={
              user ? <CreateGroup user={user} setUser={setUser} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/groups/:id" 
            element={<GroupDetails user={user} setUser={setUser} setGroups={setGroups} />} 
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
            element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" replace />} 
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchResults user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </>
  );
}

export default AppRoutes; 