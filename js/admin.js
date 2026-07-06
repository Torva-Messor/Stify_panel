// js/admin.js
let roundDuration = APP_CONFIG.DEFAULT_DURATION; 
let state = {
    roundId: Date.now().toString(),
    genre: APP_CONFIG.DEFAULT_GENRE,
    songs: [], 
    targetTimestamp: Date.now() + (APP_CONFIG.DEFAULT_DURATION * 1000),
    votingDisabled: false
};
let winnersQueue = [];

// Über globalen Kanal abonnieren
pubnub.subscribe({ channels: [APP_CONFIG.CHANNELS.ACTION] });

pubnub.addListener({
    message: function(event) {
        if (event.channel === APP_CONFIG.CHANNELS.ACTION) {
            const data = event.message;
            let stateChanged = false;
            
            if (data.action === 'SUBMIT') {
                if (state.votingDisabled) {
                    // DIREKT-MODUS: Überspringt das Voting komplett
                    if (!winnersQueue.includes(data.link)) {
                        winnersQueue.push(data.link);
                        renderQueue();
                    }
                } else {
                    // VOTING-MODUS: Reicht den Song ein, falls Limit noch nicht erreicht
                    if (state.songs.length < APP_CONFIG.MAX_SONGS_IN_VOTING && !state.songs.find(s => s.link === data.link)) {
                        state.songs.push({ id: Date.now().toString(), link: data.link, votes: 0 });
                        stateChanged = true;
                    }
                }
            }
            
            if (data.action === 'VOTE' && !state.votingDisabled) {
                const song = state.songs.find(s => s.id === data.id);
                if (song) {
                    song.votes++;
                    stateChanged = true;
                }
            }

            // Bei Änderungen SOFORT pushen, damit User Echtzeit-Feedback haben
            if (stateChanged) {
                broadcastState();
            }
        }
    }
});

// Haupt-Timer läuft im materialschonenden globalen Takt (z. B. alle 5 Sekunden)
setInterval(() => {
    if (state.votingDisabled) {
        broadcastState(); // Nur ein Heartbeat-Sync
        return;
    }

    const timeLeft = Math.max(0, Math.floor((state.targetTimestamp - Date.now()) / 1000));
    
    if (timeLeft <= 0) {
        evaluateWinner();
        startNewRound();
    } else {
        broadcastState(); 
    }
}, APP_CONFIG.HEARTBEAT_INTERVAL);

function toggleVoting() {
    state.votingDisabled = !state.votingDisabled;
    const btn = document.getElementById('toggle-voting-btn');
    const settingsCard = document.getElementById('voting-settings-card');

    if (state.votingDisabled) {
        btn.innerText = "Voting AKTIVIEREN (Normales Voting)";
        btn.style.background = "#1db954";
        settingsCard.style.display = "none";

        // Aktuelle Songs im Voting sofort in die Queue retten
        state.songs.forEach(song => {
            if (!winnersQueue.includes(song.link)) {
                winnersQueue.push(song.link);
            }
        });
        state.songs = [];
        renderQueue();
    } else {
        btn.innerText = "Voting DEAKTIVIEREN (Direkt-Modus an)";
        btn.style.background = "#e91429";
        settingsCard.style.display = "block";
        startNewRound();
    }
    broadcastState();
}

function startNewRound() {
    state.roundId = Date.now().toString();
    state.songs = [];
    state.targetTimestamp = Date.now() + (roundDuration * 1000);
    broadcastState();
}

function broadcastState() {
    const timeLeft = Math.max(0, Math.floor((state.targetTimestamp - Date.now()) / 1000));
    
    if (state.votingDisabled) {
        document.getElementById('admin-status-text').innerHTML = "Status: <strong style='color:#00bcd4;'>Direkt-Modus (Wunschbox) aktiv</strong>";
        document.getElementById('admin-song-count-text').innerText = "Einsendungen gehen sofort in die Queue.";
    } else {
        document.getElementById('admin-status-text').innerHTML = `Verbleibende Zeit: <strong>${timeLeft}</strong>s`;
        document.getElementById('admin-song-count-text').innerHTML = `Songs im Voting: <strong>${state.songs.length}</strong> / ${APP_CONFIG.MAX_SONGS_IN_VOTING}`;
    }

    pubnub.publish({
        channel: APP_CONFIG.CHANNELS.STATE,
        message: state
    });
}

function evaluateWinner() {
    if (state.songs.length === 0) return;
    let winner = state.songs.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
    winnersQueue.push(winner.link);
    renderQueue();
}

function renderQueue() {
    const list = document.getElementById('queue-list');
    list.innerHTML = '';
    winnersQueue.forEach((link, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span title="${link}">${link}</span>
            <button class="delete-btn" onclick="removeFromQueue(${index})">Löschen</button>
        `;
        list.appendChild(li);
    });
}

function removeFromQueue(index) {
    winnersQueue.splice(index, 1);
    renderQueue();
}

function updateGenre() {
    state.genre = document.getElementById('genre-input').value.trim() || "Keines";
    broadcastState();
}

function updateDuration() {
    roundDuration = parseInt(document.getElementById('duration-select').value);
}

function shortenTime() {
    if (!state.votingDisabled) {
        state.targetTimestamp = Date.now() + (10 * 1000);
        broadcastState();
    }
}

// Start beim Laden
startNewRound();

