// src/pages/HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Credits from '../components/Credits'; // Import the Credits component

const HomePage = () => {
  const navigate = useNavigate();
  const [showCredits, setShowCredits] = useState(false); // State to manage credits display

  const handleStartAdventure = () => {
    navigate('/welcome');
  };

  const handleViewCredits = () => {
    console.log("Clicked")
    setShowCredits(true); // Show the credits
  };

  const handleCloseCredits = () => {
    setShowCredits(false); // Hide the credits when finished
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
        {/* Button to view credits */}
        <button className="credits-button" onClick={handleViewCredits}>
          View Credits
        </button>
      </header>

      {/* Display credits if showCredits is true */}
      {showCredits && <Credits onCreditsEnd={handleCloseCredits} />}
    </div>
  );
};

export default HomePage;