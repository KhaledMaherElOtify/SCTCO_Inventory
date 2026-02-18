import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ isLoading = true, message = 'Starting backend server...' }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h1>CSTCO Inventory</h1>
        <p className="loading-message">
          {message}
          <span className="loading-dots">{dots}</span>
        </p>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
}
