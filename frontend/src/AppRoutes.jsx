import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './Components/Home/Home';
import Profile from './pages/Profile/Profile';
import Groups from './pages/Groups/Groups';
import GroupDetails from './pages/GroupDetails/GroupDetails';
import ManageRequests from './pages/GroupDetails/ManageRequests';
import CreateGroup from './pages/CreateGroup/CreateGroup';
import Events from './pages/Events/Events';
import CreateEvent from './pages/CreateEvent/CreateEvent';
import EventDetails from './pages/EventDetails/EventDetails';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import Navbar from './Components/Navbar/Navbar';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import SearchResults from './pages/SearchResults/SearchResults';
import BACKEND_URL from './config';

function AppRoutes({ loading, setLoading, user, setUser }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  // Check for existing JWT token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
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
        setLoading(false);
      } else {
        // No token, check Firebase auth
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // User is logged in with Firebase, but we need to get JWT token
            try {
              const idToken = await firebaseUser.getIdToken();
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
    };

    checkAuthStatus();
    // eslint-disable-next-line
  }, [setLoading, setUser]);

  const handleLogout = useCallback(async () => {
    try {
      // 1. Call backend logout endpoint
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(`${BACKEND_URL}/api/users/logout`, {
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
  }, [setUser]);

  // Remove local loading spinner UI, rely on Loader in App.jsx

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
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  <span className="flex-1 ml-2">{message}</span>
                  {t.type !== 'loading' && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="ml-2 rounded-full p-1 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                      aria-label="Dismiss notification"
                      tabIndex={0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
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
            element={<Groups user={user} setUser={setUser} groups={groups} setGroups={setGroups} setLoading={setLoading} />} 
          />
          <Route 
            path="/groups/create" 
            element={
              user ? <CreateGroup user={user} setUser={setUser} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/groups/:id" 
            element={<GroupDetails user={user} setUser={setUser} setGroups={setGroups} setLoading={setLoading} />} 
          />
          <Route 
            path="/groups/:id/manage-requests" 
            element={
              user ? <ManageRequests user={user} setUser={setUser} setLoading={setLoading} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/events" 
            element={<Events user={user} setUser={setUser} setLoading={setLoading} />} 
          />
          <Route 
            path="/events/create" 
            element={
              user ? <CreateEvent user={user} setUser={setUser} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/events/:id" 
            element={<EventDetails user={user} setUser={setUser} setLoading={setLoading} />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} setUser={setUser} setLoading={setLoading} /> : <Navigate to="/login" replace />} 
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchResults user={user} setUser={setUser} setLoading={setLoading} />} />
        </Routes>
      </div>
    </>
  );
}

export default AppRoutes; 