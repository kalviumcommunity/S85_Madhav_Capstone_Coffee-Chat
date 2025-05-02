import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="hero-container">
        <h1 className="title">Welcome to Coffee Chat</h1>
        <p className="subtitle">Where conversations begin and communities grow.</p>
        <button className="cta-button" onClick={() => alert('Coming Soon!')}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;
