// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartAdventure = () => {
    navigate('/welcome');
  };

  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Welcome to Ancient Egypt</h1>
        <p>
          Explore the culture, history, and traditions of Ancient Egypt. Interact with the Pharaoh and discover his secrets!
        </p>
        <button className="explore-button" onClick={handleStartAdventure}>
          Start the Adventure
        </button>
      </header>
    </div>
  );
};

export default HomePage;