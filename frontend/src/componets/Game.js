// Import React hooks and styles
// focous on displaying game question, handling user input and communicate with the backend
import React, { useEffect, useState } from 'react';
import './Game.css';

// Main Game component
export default function Game({ onLogout }) {

  // ---------- STATE VARIABLES ----------
  const [imageBase64, setImageBase64] = useState('');   // Stores question image in base64
  const [answer, setAnswer] = useState('');             // User's input answer
  const [message, setMessage] = useState('');           // Feedback message for user
  const [solution, setSolution] = useState(null);       // Correct answer from backend
  const [isChecking, setIsChecking] = useState(false);  // True when checking user's answer
  const [isLoading, setIsLoading] = useState(true);     // True when question is loading
  const [score, setScore] = useState(0);                // User's current score
  const [userId, setUserId] = useState(null);           // User ID from localStorage

  // ---------- FETCH QUESTION FROM BACKEND ----------

  const fetchQuestion = () => {
    setIsLoading(true); // Show loading indicator

    // API call to fetch a new question (image + solution)
    fetch('http://127.0.0.1:8000/api/game/question')
      .then(res => res.json())
      .then(data => {
        // Set the question data
        setImageBase64(data.image_base64);
        setSolution(data.solution);
        setMessage('');
        setAnswer('');
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMessage('Error loading question. Please try again.');
        setIsLoading(false);
      });
  };

  // Get user_id from localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    }
  }, []);

  // Loads first question automatically
  useEffect(() => {
    fetchQuestion();
  }, []);

  // ---------- HANDLE SUBMIT ----------
  
  const handleSubmit = () => {
    // If no answer entered
    if (answer === '') {
      setMessage('Please enter an answer!');
      return;
    }

    // If question hasn’t loaded yet
    if (solution === null) {
      setMessage('Please wait...');
      return;
    }

    setIsChecking(true);

    const userAnswer = parseInt(answer.trim()); // Convert input to number

    // Checks if input is valid number
    if (isNaN(userAnswer)) {
      setMessage('Please enter a valid number');
      setIsChecking(false);
      return;
    }

    // Compares user's answer with correct solution
    const isCorrect = userAnswer === solution;
    
    if (isCorrect) {
      // Increment score if answer is correct
      const newScore = score + 1;
      setScore(newScore);
      setMessage(`Correct Your Score is: ${newScore}`);
      
      // Save score to database if user is logged in (only when score changes)
      if (userId) {
        saveScoreToDatabase(userId, newScore);
      }
    } else {
      setMessage(`Incorrect! The correct answer is ${solution}. Score: ${score}`);
    }

    setIsChecking(false);

    // Automatically load next question after 2 seconds
    setTimeout(() => {
      fetchQuestion();
    }, 2000);
  };

  // ---------- SAVE SCORE TO DATABASE ----------
  const saveScoreToDatabase = (user_id, current_score) => {
    fetch('http://127.0.0.1:8000/api/game/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        score: current_score
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Score saved:', data);
    })
    .catch(err => {
      console.error('Error saving score:', err);
    });
  };

  // ---------- DETERMINE MESSAGE COLOR ----------
  const getMessageClass = () => {
    if (!message) return '';
    if (message.includes('Correct')) return 'message-correct';
    if (message.includes('Incorrect')) return 'message-incorrect';
    if (message.includes('Error') || message.includes('valid')) return 'message-error';
    return 'message-info';
  };

  // ---------- RENDER THE COMPONENT ----------
  return (
    <div className="game-container">
      <div className="game-content">
        <div className="game-header">
          <h1 className="game-title">Heart Game</h1>
          <div className="game-header-right">
            <div className="score-display">
              <span className="score-label">Score:</span>
              <span className="score-value">{score}</span>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout} 
                className="logout-button"
                title="Logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        
        {/* Display question image or loading text */}
        <div className="question-image-container">
          {isLoading ? (
            <div>Loading question...</div>
          ) : imageBase64 ? (
            <img
              src={`data:image/png;base64,${imageBase64}`}
              alt="Question"
              className="question-image"
            />
          ) : (
            <div>No image available</div>
          )}
        </div>

        {/* Input field and Submit button */}
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)} // Capture user input / changes
            onKeyDown={(e) => {
              // Allow pressing Enter to submit
              if (e.key === 'Enter' && !isChecking && !isLoading) { // listen for Enter key
                handleSubmit();
              }
            }}
            disabled={isChecking || isLoading}
            className="answer-input"
          />

          <button 
            onClick={handleSubmit} // trigger answer submission
            disabled={isChecking || isLoading}
            className="submit-button"
          >
            {isChecking ? (
              <>
                {/* Loading spinner when checking */}
                <span className="loading-spinner"></span>
                Checking...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>

        {/* Display message (Correct / Incorrect / Error) */}
        {message && (
          <div className="message-container">
            <div className={`message ${getMessageClass()}`}>
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
