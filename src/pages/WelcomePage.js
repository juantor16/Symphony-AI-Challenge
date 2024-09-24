// src/pages/WelcomePage.js
import React, { useState, useEffect } from 'react';
import './WelcomePage.css';

const WelcomePage = () => {
    const [userName, setUserName] = useState('');
    const [pharaohMessage, setPharaohMessage] = useState('Welcome to my kingdom! Please introduce yourself.');
    const [displayedMessage, setDisplayedMessage] = useState('');
    const [showInput, setShowInput] = useState(true);
    const [messageIndex, setMessageIndex] = useState(0);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('../assets/pharaohBackground.png');
    const [quizMode, setQuizMode] = useState(false);
    const [questionsList, setQuestionsList] = useState([]); // Store all questions
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showNextButton, setShowNextButton] = useState(false);
    const [showModal, setShowModal] = useState(false); // New state for modal
    const [pharaohMatch, setPharaohMatch] = useState(null); // Store pharaoh match
    const [personalityTraits, setPersonalityTraits] = useState([]); // Personality trait answers
    const [traitIndex, setTraitIndex] = useState(0);

    const personalityQuestions = [
        "What kind of leader are you? (e.g., strategic, charismatic, fearless)",
        "Do you prefer peace or war to achieve your goals?",
        "How do you handle challenges: with intelligence, force, or diplomacy?",
        "Are you more focused on building structures or expanding territories?",
        "What's more important: being loved by your people or feared by your enemies?"
    ];

    // Function to play audio
    const playAudio = (audioFile) => {
        const audio = new Audio(audioFile);
        audio.volume = 0.3;
        audio.play();
    };

    // Automatically play the introduction audio when the page loads
    useEffect(() => {
        playAudio('/introduction.mp3'); // Make sure the path is correct relative to the public folder
    }, []);

    // Typing effect for the message
    useEffect(() => {
        if (messageIndex < pharaohMessage.length) {
            const timeoutId = setTimeout(() => {
                setDisplayedMessage((prev) => prev + pharaohMessage.charAt(messageIndex));
                setMessageIndex((prev) => prev + 1);
            }, 50); // Speed of typing effect
            return () => clearTimeout(timeoutId);
        }
    }, [messageIndex, pharaohMessage]);

    const handleNameSubmit = () => {
        if (userName.trim() !== '') {
            const newMessage = `Ah, welcome ${userName}! I am the PhAIraoh, your guide through the wonders of Ancient Egypt. Let's begin your challenge! Answer my questions correctly to win.`;
            setPharaohMessage(newMessage);
            setDisplayedMessage('');
            setMessageIndex(0);
            setShowInput(false);

            // Instead of changing to quiz mode immediately, just start fetching questions
            fetchAllQuestions();
        }
    };

    // Function to fetch questions and start the quiz
    const fetchAllQuestions = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/generate-questions'); // Fetch from AI endpoint
            const data = await response.json();

            if (data.questions && data.questions.length > 0) {
                setQuestionsList(data.questions);
                setCurrentQuestion(data.questions[0]); // Set the first question
                setPharaohMessage('The questions have been generated! Let’s begin your challenge!');

                // Reset displayed message and start typing effect for the first question
                setDisplayedMessage('');
                setMessageIndex(0);

                // Activate quiz mode after questions have been fetched
                setQuizMode(true);
            } else {
                setPharaohMessage("I'm having trouble creating questions right now. Please try again.");
                setQuestionsList([]); // Reset questions list if none are retrieved
                setCurrentQuestion(null); // Clear the current question if the list is empty
            }
        } catch (error) {
            console.error('Error fetching AI-generated questions:', error);
            setPharaohMessage("There was an issue with generating questions. Please try again.");
            setQuestionsList([]); // Reset the questions list on error
            setCurrentQuestion(null); // Clear the current question on error
        }
    };

    const handleAnswerSubmit = (selectedOption) => {
        if (selectedOption) {
            console.log('Selected option:', selectedOption);
            console.log('Correct answer:', currentQuestion.correctAnswer.split(' ').slice(1).join(' '));

            // Set the pharaoh's message based on the correctness of the answer
            if (selectedOption === currentQuestion.correctAnswer.split(' ').slice(1).join(' ')) {
                setPharaohMessage(`Well done, ${userName}! That is correct! ${currentQuestion.explanation}`);
                setScore(score + 1);
            } else {
                setPharaohMessage(`Ah, that's not quite right. The correct answer is ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`);
            }

            // Reset the displayed message and start the typing effect again
            setDisplayedMessage('');
            setMessageIndex(0);
            setUserAnswer('');
            setQuizMode(false); // Temporarily exit quiz mode to show the pharaoh's response

            // Display the "Next Question" button after a brief delay
            setTimeout(() => {
                setShowNextButton(true);
            }, 5000); // Adjust delay as needed
        }
    };

    const handleNextQuestion = () => {
        const nextIndex = questionIndex + 1;
        if (nextIndex < questionsList.length) {
            setQuestionIndex(nextIndex);
            setCurrentQuestion(questionsList[nextIndex]);

            // Set the new question message
            setPharaohMessage(questionsList[nextIndex].question);

            // Reset the displayed message and start the typing effect again
            setDisplayedMessage('');
            setMessageIndex(0);

            // Hide the "Next Question" button and re-enter quiz mode
            setShowNextButton(false);
            setQuizMode(true);
        } else {
            // Final message after the quiz is complete
            if (score >= 5) {
                setPharaohMessage(`Congratulations ${userName}! You've proven yourself worthy! You scored ${score}/${questionsList.length}, earning the title of a true Pharaoh! 🎉`);
            } else {
                setPharaohMessage(`Well done ${userName}, you've completed the challenge with a score of ${score}/${questionsList.length}. Keep studying to become a master of ancient Egypt!`);
            }

            // Reset the displayed message and start the typing effect again
            setDisplayedMessage('');
            setMessageIndex(0);
            setShowNextButton(false);

            // Delay hiding the quiz to allow the message to be shown
            setTimeout(() => {
                setQuizMode(false);
            }, 5000); // Adjust the delay (5 seconds) as needed
            setShowModal(true); // Show the modal when the quiz ends
        }
    };

    const handlePharaohMatch = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/pharaoh-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personalityTraits })
            });
            const data = await response.json();
            setPharaohMatch(data.match);
        } catch (error) {
            console.error('Error fetching pharaoh match:', error);
            setPharaohMatch('Sorry, I could not determine which pharaoh you would have been.');
        }
    };

    const handlePersonalityQuestion = (answer) => {
        const updatedTraits = [...personalityTraits, answer];
        setPersonalityTraits(updatedTraits);

        if (traitIndex + 1 < personalityQuestions.length) {
            setTraitIndex(traitIndex + 1);
        } else {
            handlePharaohMatch();
        }
    };


    return (
        <div className={`welcome-page ${isFadingOut ? 'fade-out' : 'fade-in'}`} style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="pharaoh-container">
                <img src="/phairaoh.png" alt="Pharaoh" className="pharaoh-avatar" />
            </div>
            <div className="dialogue-box">
                {/* Display the pharaohMessage only if we are not in quiz mode */}
                {!quizMode && (
                    <>
                        <p>{displayedMessage}</p>
                        {/* Display the input section only when showInput is true */}
                        {showInput && (
                            <div className="input-section">
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                                <button onClick={handleNameSubmit}>Submit</button>
                            </div>
                        )}
                    </>
                )}

                {/* Display the question when in quiz mode */}
                {quizMode && currentQuestion && !showNextButton && (
                    <div className="input-section">
                        <p>{currentQuestion.question}</p>
                        {currentQuestion.options && currentQuestion.options.length > 0 ? (
                            currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSubmit(option)} // Automatically submit the answer
                                    style={{ margin: '5px', padding: '5px 10px' }}
                                >
                                    {option}
                                </button>
                            ))
                        ) : (
                            <p>Loading options... Please wait.</p>
                        )}
                    </div>
                )}
                {quizMode && !currentQuestion && (
                    <div className="input-section">
                        <p>It seems there was an issue generating the questions. Would you like to try again?</p>
                        <button onClick={fetchAllQuestions}>Retry</button>
                    </div>
                )}

                {showNextButton && (
                    <div className="input-section">
                        <button onClick={handleNextQuestion}>Next Question</button>
                    </div>
                )}

                {/* Display the modal when the quiz ends */}
                {showModal && (
                    <div className="modal">
                        {!pharaohMatch ? (
                            <>
                                {traitIndex < personalityQuestions.length ? (
                                    <div>
                                        <p>{personalityQuestions[traitIndex]}</p>
                                        <button onClick={() => handlePersonalityQuestion('Strategic')}>Strategic</button>
                                        <button onClick={() => handlePersonalityQuestion('Fearless')}>Fearless</button>
                                    </div>
                                ) : (
                                    <div>Loading...</div>
                                )}
                            </>
                        ) : (
                            <div>
                                <p>{pharaohMatch}</p>
                                <button onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomePage;