// frontend score UI + server save helpers

let score = 0;
const USER_ID = window.APP_USER_ID || null; // set this in your page template if available

function getScoreElement() {
    return document.getElementById('score');
}

function updateScoreDisplay() {
    const el = getScoreElement();
    if (el) el.textContent = `Score: ${score}`;
}

function addPoints(points = 1, persist = false) {
    score += points;
    updateScoreDisplay();
    if (persist) saveScoreCheckpoint();
}

function saveScoreCheckpoint() {
    // Adjust endpoint and payload to match your server. Include user_id if required.
    fetch('/api/scores/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID, score })
    }).catch(err => console.error('Failed to save score checkpoint', err));
}

function saveFinalScore() {
    fetch('/api/scores/final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID, score })
    }).catch(err => console.error('Failed to save final score', err));
}

// Example usage: call after each question is answered
function onAnswerChecked(isCorrect) {
    if (isCorrect) {
        addPoints(1 /*points*/, false /*persist now?*/);
    } else {
        updateScoreDisplay();
    }
    // Optionally persist every question:
    // addPoints(0, true);
}

// Call saveFinalScore() when quiz ends