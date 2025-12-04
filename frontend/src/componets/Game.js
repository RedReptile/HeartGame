import React, { useEffect, useState, useCallback } from 'react';
import './Game.css';

/**
 * Game Component
 * -----------------
 * This component renders the Heart Game UI, including the question image,
 * answer input, score display, user info, and leaderboard. 
 * It is designed using an event-driven approach where user actions
 * (submit answer, refresh leaderboard, logout) trigger state updates and side effects.
 */
export default function Game({ onLogout }) {
  // ------------------
  // State Variables
  // ------------------
  const [imageBase64, setImageBase64] = useState('');      // Base64 string of the current question image
  const [answer, setAnswer] = useState('');               // User's input answer
  const [message, setMessage] = useState('');            // Feedback message (Correct/Wrong/Error)
  const [solution, setSolution] = useState(null);        // Correct answer for current question
  const [isChecking, setIsChecking] = useState(false);   // Flag to indicate if answer is being checked
  const [isLoading, setIsLoading] = useState(true);      // Flag to indicate if question is loading
  const [score, setScore] = useState(0);                 // Current user's score
  const [userId, setUserId] = useState(null);            // Logged-in user ID
  const [username, setUsername] = useState('');          // Logged-in user's name
  const [leaderboard, setLeaderboard] = useState([]);    // Leaderboard entries
  const [leaderboardLoading, setLeaderboardLoading] = useState(true); // Loading state for leaderboard
  const [leaderboardError, setLeaderboardError] = useState('');       // Error message for leaderboard

  // ------------------
  // Fetch a new question from the backend
  // ------------------
  const fetchQuestion = () => {
    setIsLoading(true);
    fetch('http://127.0.0.1:8000/api/game/question')
      .then(res => res.json())
      .then(data => {
        setImageBase64(data.image_base64);
        setSolution(data.solution);
        setMessage('');
        setAnswer('');
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMessage('Error loading question');
        setIsLoading(false);
      });
  };

  // ------------------
  // Load stored user info from localStorage on mount
  // ------------------
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    const storedUsername = localStorage.getItem('username');
    if (storedUserId) setUserId(parseInt(storedUserId, 10));
    if (storedUsername) setUsername(storedUsername);
  }, []);

  // Fetch the first question when the component mounts
  useEffect(() => {
    fetchQuestion();
  }, []);

  // ------------------
  // Fetch leaderboard from backend
  // ------------------
  const fetchLeaderboard = useCallback(() => {
    setLeaderboardLoading(true);
    setLeaderboardError('');
    fetch('http://127.0.0.1:8000/api/game/leaderboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        setLeaderboardLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLeaderboardError('Unable to load');
        setLeaderboardLoading(false);
      });
  }, []);

  // Auto-refresh leaderboard every 30 seconds
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // ------------------
  // Handle answer submission
  // ------------------
  const handleSubmit = () => {
    if (answer === '') {
      setMessage('Enter an answer!');
      return;
    }
    if (solution === null) {
      setMessage('Please wait...');
      return;
    }
    setIsChecking(true);
    const userAnswer = parseInt(answer.trim());
    if (isNaN(userAnswer)) {
      setMessage('Enter a valid number');
      setIsChecking(false);
      return;
    }

    const isCorrect = userAnswer === solution;

    // Event-driven update: correct answer triggers score update and message
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setMessage(`Correct! Score: ${newScore}`);
      if (userId) {
        saveScoreToDatabase(userId, newScore).finally(() => fetchLeaderboard());
      }
    } else {
      setMessage(`Wrong! Answer: ${solution}`);
    }

    setIsChecking(false);

    // After a delay, fetch a new question (event-driven)
    setTimeout(() => fetchQuestion(), 2000);
  };

  // ------------------
  // Save score to backend
  // ------------------
  const saveScoreToDatabase = (user_id, current_score) => {
    return fetch('http://127.0.0.1:8000/api/game/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, score: current_score })
    })
    .then(res => res.json())
    .catch(err => console.error('Error saving score:', err));
  };

  // ------------------
  // Determine message styling based on content
  // ------------------
  const messageClass = message
    ? message.includes('Correct')
      ? 'message message-correct'
      : message.includes('Wrong')
      ? 'message message-incorrect'
      : 'message message-info'
    : '';

  // ------------------
  // Render component
  // ------------------
  return (
    <div className="game-container">
      {/* Left side: game content */}
      <div className="game-left">
        <div className="game-content">
          {/* Header: game title, user info, score, logout */}
          <div className="game-header">
            <h1 className="game-title">❤️ Heart Game</h1>
            <div className="game-header-right">
              {username && (
                <div className="user-badge">
                  <span className="user-name">{username}</span>
                </div>
              )}
              <div className="score-display">
                <span className="score-label">Score</span>
                <span className="score-value">{score}</span>
              </div>
              {onLogout && (
                <button className="logout-button" onClick={onLogout}>
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Question image */}
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

          {/* Answer input */}
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isChecking && !isLoading) {
                  handleSubmit();
                }
              }}
              disabled={isChecking || isLoading}
              className="answer-input"
            />
            <button
              onClick={handleSubmit}
              disabled={isChecking || isLoading}
              className="submit-button"
            >
              {isChecking ? (
                <>
                  <span className="loading-spinner" />
                  Checking...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>

          {/* Message display */}
          <div className="message-container">
            {message && <div className={messageClass}>{message}</div>}
          </div>
        </div>
      </div>

      {/* Right side: leaderboard */}
      <div className="game-right">
        <div className="leaderboard-panel">
          <div className="leaderboard-header">
            <h2>🏆 Leaderboard</h2>
            <button
              onClick={fetchLeaderboard}
              disabled={leaderboardLoading}
              className="refresh-button"
            >
              {leaderboardLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {leaderboardError && (
            <div className="leaderboard-message error">{leaderboardError}</div>
          )}

          {!leaderboardError && leaderboardLoading && (
            <div className="leaderboard-message info">Loading leaderboard...</div>
          )}

          {!leaderboardLoading && !leaderboardError && leaderboard.length === 0 && (
            <div className="leaderboard-message info">
              🎮 No players yet. Be the first!
            </div>
          )}

          {!leaderboardLoading && !leaderboardError && leaderboard.length > 0 && (
            <div className="leaderboard-scroll">
              <div className="leaderboard-table-wrapper">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Score</th>
                      <th>Tries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.user_id}
                        className={
                          entry.username === username ? 'highlight-row' : undefined
                        }
                      >
                        <td>
                          {index === 0
                            ? '🥇'
                            : index === 1
                            ? '🥈'
                            : index === 2
                            ? '🥉'
                            : index + 1}
                        </td>
                        <td>{entry.username}</td>
                        <td>{entry.best_score}</td>
                        <td>{entry.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
