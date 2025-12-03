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

// Configuration: set API base and endpoint to match your backend route.
// If your backend exposes leaderboard at e.g. /api/game/leaderboard, set API_BASE = '/api'
const API_BASE = window.API_BASE || ''; // adjust if needed, e.g. '/api'
const LEADERBOARD_ENDPOINT = `${API_BASE}/game/leaderboard`; // change to match backend

// Create leaderboard container in the page (only once)
function ensureLeaderboardContainer() {
    let lb = document.getElementById('leaderboard');
    if (!lb) {
        lb = document.createElement('aside');
        lb.id = 'leaderboard';
        lb.style.cssText = 'position:fixed; right:16px; top:16px; width:260px; max-height:60vh; overflow:auto; background:#111; color:#eee; padding:12px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.5); z-index:9999; font-family:Arial, sans-serif; font-size:14px;';
        const title = document.createElement('div');
        title.textContent = 'Leaderboard';
        title.style.cssText = 'font-weight:700; margin-bottom:8px; text-align:center;';
        lb.appendChild(title);

        const list = document.createElement('ol');
        list.id = 'leaderboard-list';
        list.style.cssText = 'padding-left:18px; margin:0;';
        lb.appendChild(list);

        document.body.appendChild(lb);
    }
    return lb;
}

function renderLeaderboard(entries) {
    ensureLeaderboardContainer();
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';

    if (!entries || entries.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No scores yet';
        li.style.cssText = 'color:#aaa;';
        list.appendChild(li);
        return;
    }

    // entries expected as array of { username, score } or similar
    entries.forEach(e => {
        const li = document.createElement('li');
        const name = document.createElement('span');
        name.textContent = e.username ?? e.user ?? 'Unknown';
        name.style.cssText = 'display:inline-block; width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';
        const score = document.createElement('span');
        score.textContent = (typeof e.score === 'number') ? e.score : (e.points ?? e.value ?? '');
        score.style.cssText = 'float:right; font-weight:700;';
        li.appendChild(name);
        li.appendChild(score);
        list.appendChild(li);
    });
}

async function fetchLeaderboard() {
    try {
        const res = await fetch(LEADERBOARD_ENDPOINT, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include' // if your backend uses cookies / sessions; remove if not needed
        });
        if (!res.ok) {
            console.warn('Leaderboard fetch failed:', res.status);
            return;
        }
        const data = await res.json();
        // if backend wraps results, e.g. { data: [...] } adjust accordingly:
        const entries = Array.isArray(data) ? data : (data.data ?? data.entries ?? []);
        renderLeaderboard(entries);
    } catch (err) {
        console.error('Failed to load leaderboard:', err);
    }
}

// Example: refresh leaderboard every 15s
let leaderboardInterval = null;
function startLeaderboardAutoRefresh(intervalMs = 15000) {
    fetchLeaderboard();
    if (leaderboardInterval) clearInterval(leaderboardInterval);
    leaderboardInterval = setInterval(fetchLeaderboard, intervalMs);
}
function stopLeaderboardAutoRefresh() {
    if (leaderboardInterval) clearInterval(leaderboardInterval);
    leaderboardInterval = null;
}

// Call this when the game UI initializes
startLeaderboardAutoRefresh();

// Optionally, call fetchLeaderboard() after the player finishes a run / posts score