import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './App.css';
import './Components/Navbar/Navbar.css';
// Import Loader and its CSS
import Loader from './Components/Loader';
import './Components/Loader.css';
import { useState } from 'react';

function App() {
  // App-wide loading and user state
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Loader will show while loading is true (controlled by AppRoutes)
  return (
    <>
      <Loader loading={loading} />
      <Router>
        <AppRoutes loading={loading} setLoading={setLoading} user={user} setUser={setUser} />
      </Router>
    </>
  );
}

export default App;
