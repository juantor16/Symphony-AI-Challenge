// src/components/Credits.js
import React, { useEffect, useState } from 'react';
import './Credits.css';

const Credits = ({ onCreditsEnd }) => {
    const [scrollPosition, setScrollPosition] = useState(window.innerHeight);
    const [hasReachedTop, setHasReachedTop] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!hasReachedTop) {
                setScrollPosition((prev) => {
                    if (prev > 0) {
                        return prev - 2; // Adjust scroll speed as needed
                    } else {
                        setHasReachedTop(true); // Mark when we've reached the top
                        return 0;
                    }
                });
            }
        }, 20); // Adjust speed as needed

        return () => clearInterval(interval);
    }, [hasReachedTop]);

    // Trigger the end credits only after some delay once it stops scrolling
    useEffect(() => {
        if (hasReachedTop) {
            const timeout = setTimeout(() => {
                onCreditsEnd();
            }, 10000); // Adjust delay time (e.g., 3 seconds) to keep the credits displayed

            return () => clearTimeout(timeout);
        }
    }, [hasReachedTop, onCreditsEnd]);

    // Close the credits when clicking outside
    const handleOutsideClick = (e) => {
        if (e.target.className === "credits-overlay") {
            onCreditsEnd();
        }
    };

    return (
        <div className="credits-overlay" onClick={handleOutsideClick}>
            <div className="credits-container" style={{ transform: `translateY(${scrollPosition}px)` }}>
                <div className="credits-content">
                    <h2>Symphony Solutions AI Challenge</h2>
                    <p>This project was created for the Symphony Solutions AI Challenge.</p>
                    <p>Developed by: AFK Team</p>
                    <p>Members: Lucas Chagas, Biljana Ristovska, Juan Torres</p>
                    <p>Special thanks to: Symphony Solutions for organizing this challenge and inspiring us to explore AI's potential.</p>
                    <p>
                        This project demonstrates how AI can be used to create interactive educational experiences. We hope you enjoyed your journey
                        through Ancient Egypt!
                    </p>
                    <p>Tools & Technologies Used:</p>
                    <ul>
                        <li>React & JavaScript</li>
                        <li>OpenAI GPT-3.5</li>
                        <li>Express & Node.js</li>
                    </ul>
                    <h3>Thank you for participating!</h3>
                </div>
            </div>
        </div>
    );
};

export default Credits;