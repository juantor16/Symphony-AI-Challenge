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
    const [traitAnswer, setTraitAnswer] = useState(''); // State to handle text input for personality questions

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

    const fetchAllQuestions = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/generate-questions'); // Fetch from AI endpoint
            const data = await response.json();

            if (data.questions && data.questions.length > 0) {
                setQuestionsList(data.questions);
                setCurrentQuestion(data.questions[0]); // Set the first question
                setPharaohMessage('The questions have been generated! Let’s begin your challenge!');

                setDisplayedMessage('');
                setMessageIndex(0);
                setQuizMode(true);
            } else {
                setPharaohMessage("I'm having trouble creating questions right now. Please try again.");
                setQuestionsList([]);
                setCurrentQuestion(null);
            }
        } catch (error) {
            console.error('Error fetching AI-generated questions:', error);
            setPharaohMessage("There was an issue with generating questions. Please try again.");
            setQuestionsList([]);
            setCurrentQuestion(null);
        }
    };

    const handleAnswerSubmit = (selectedOption) => {
        if (selectedOption) {
            if (selectedOption === currentQuestion.correctAnswer.split(' ').slice(1).join(' ')) {
                setPharaohMessage(`Well done, ${userName}! That is correct! ${currentQuestion.explanation}`);
                setScore(score + 1);
            } else {
                setPharaohMessage(`Ah, that's not quite right. The correct answer is ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`);
            }
            setDisplayedMessage('');
            setMessageIndex(0);
            setUserAnswer('');
            setQuizMode(false);

            setTimeout(() => {
                setShowNextButton(true);
            }, 5000);
        }
    };

    const handleNextQuestion = () => {
        const nextIndex = questionIndex + 1;
        if (nextIndex < questionsList.length) {
            setQuestionIndex(nextIndex);
            setCurrentQuestion(questionsList[nextIndex]);
            setPharaohMessage(questionsList[nextIndex].question);
            setDisplayedMessage('');
            setMessageIndex(0);
            setShowNextButton(false);
            setQuizMode(true);
        } else {
            setPharaohMessage(`You completed the challenge with a score of ${score}/${questionsList.length}. Now let's see which pharaoh you would have been...`);
            setDisplayedMessage('');
            setMessageIndex(0);
            setShowNextButton(false);

            setTimeout(() => {
                setShowModal(true); // Start the personality questions
            }, 5000);
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

    const handlePersonalityQuestionSubmit = () => {
        if (traitAnswer.trim() !== '') {
            const updatedTraits = [...personalityTraits, traitAnswer.trim()];
            setPersonalityTraits(updatedTraits);
            setTraitAnswer(''); // Clear input

            if (traitIndex + 1 < personalityQuestions.length) {
                setTraitIndex(traitIndex + 1);
            } else {
                handlePharaohMatch();
            }
        }
    };

    return (
        <div className={`welcome-page ${isFadingOut ? 'fade-out' : 'fade-in'}`} style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="pharaoh-container">
                <img src="/phairaoh.png" alt="Pharaoh" className="pharaoh-avatar" />
            </div>
            <div className="dialogue-box">
                {!quizMode && (
                    <>
                        <p>{displayedMessage}</p>
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

                {quizMode && currentQuestion && !showNextButton && (
                    <div className="input-section">
                        <p>{currentQuestion.question}</p>
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSubmit(option)}
                                style={{ margin: '5px', padding: '5px 10px' }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                {showNextButton && (
                    <div className="input-section">
                        <button onClick={handleNextQuestion}>Next Question</button>
                    </div>
                )}

                {showModal && (
                    <div className="modal">
                        {!pharaohMatch ? (
                            <div>
                                <p>{personalityQuestions[traitIndex]}</p>
                                <input
                                    type="text"
                                    value={traitAnswer}
                                    placeholder="Your answer"
                                    onChange={(e) => setTraitAnswer(e.target.value)}
                                />
                                <button onClick={handlePersonalityQuestionSubmit}>Submit</button>
                            </div>
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