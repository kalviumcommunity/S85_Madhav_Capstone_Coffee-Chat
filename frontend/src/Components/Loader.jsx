import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import './Loader.css';
// Update the path below if your Lottie JSON is elsewhere
import coffeeLottie from '../assets/Coffee love.json';

/**
 * Loader component
 * @param {Object} props
 * @param {boolean} props.loading - Whether to show the loader
 */
const Loader = ({ loading }) => {
  const [visible, setVisible] = useState(loading);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      // Wait for fade-out transition before removing from DOM
      const timeout = setTimeout(() => setVisible(false), 500); // match CSS duration
      return () => clearTimeout(timeout);
    } else {
      setVisible(true);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      ref={loaderRef}
      className={`loader-overlay${loading ? '' : ' loader-fade-out'}`}
    >
      <div className="loader-content">
        <Lottie
          animationData={coffeeLottie}
          loop
          autoplay
          className="loader-lottie"
          style={{ width: 220, height: 220 }}
        />
        <div className="loader-message">
          Brewing your chat<span className="loader-dots" />
        </div>
      </div>
    </div>
  );
};

export default Loader; 