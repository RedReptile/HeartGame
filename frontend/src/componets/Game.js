import React, { useEffect, useState, useCallback } from 'react';
import './Game.css';

export default function Game({ onLogout }) {
  const [imageBase64, setImageBase64] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [solution, setSolution] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');

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

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    const storedUsername = localStorage.getItem('username');
    if (storedUserId) setUserId(parseInt(storedUserId, 10));
    if (storedUsername) setUsername(storedUsername);
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, []);

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

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

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
    setTimeout(() => fetchQuestion(), 2000);
  };

  const saveScoreToDatabase = (user_id, current_score) => {
    return fetch('http://127.0.0.1:8000/api/game/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, score: current_score })
    })
    .then(res => res.json())
    .catch(err => console.error('Error saving score:', err));
  };

  const messageClass = message
    ? message.includes('Correct')
      ? 'message message-correct'
      : message.includes('Wrong')
      ? 'message message-incorrect'
      : 'message message-info'
    : '';

  return (
    <div className="game-container">
      <div className="game-left">
        <div className="game-content">
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

          <div className="message-container">
            {message && <div className={messageClass}>{message}</div>}
          </div>
        </div>
      </div>

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