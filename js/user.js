// js/user.js
let hasVoted = false;
let hasSubmitted = false;
let localTimerInterval = null;
let currentRoundId = null;
let isVotingDisabledCurrently = false;

// Über globalen Kanal abonnieren
pubnub.subscribe({ channels: [APP_CONFIG.CHANNELS.STATE] });

pubnub.addListener({
    message: function(event) {
        if (event.channel === APP_CONFIG.CHANNELS.STATE) {
            const state = event.message;
            isVotingDisabledCurrently = state.votingDisabled;

            document.getElementById('genre-display').innerText = state.genre;

            // MODUS-PRÜFUNG (Voting vs. Direkt-Modus)
            if (state.votingDisabled) {
                // Ansicht für den Direkt-Modus (Wunschbox)
                clearInterval(localTimerInterval);
                document.getElementById('time-badge-container').innerHTML = "<span style='color: #00bcd4;'>🚀 Direkt-Modus aktiv!</span><br><small style='font-size:0.8rem; color:#aaa;'>Alle Songs gehen sofort an den DJ</small>";
                document.getElementById('list-title').innerText = "Warteschlange aktiv";
                document.getElementById('submit-title').innerText = "Song direkt an den DJ senden";
                document.getElementById('submit-btn').disabled = false; // Im Direktmodus darf man mehrfach wünschen
                document.getElementById('voting-list').innerHTML = '<li style="justify-content: center; color: #888;">Schicke deine Songwünsche oben ab!</li>';
            } else {
                // Ansicht für das normale Voting
                document.getElementById('list-title').innerText = `Aktuelle Auswahl (Max ${APP_CONFIG.MAX_SONGS_IN_VOTING})`;
                document.getElementById('submit-title').innerText = "Song vorschlagen";

                if (currentRoundId !== state.roundId) {
                    currentRoundId = state.roundId;
                    hasVoted = false;
                    hasSubmitted = false;
                    document.getElementById('submit-btn').disabled = false;
                }

                renderVotingList(state.songs);
                
                // Limitschonender lokaler Countdown (berechnet via Systemzeit)
                clearInterval(localTimerInterval);
                localTimerInterval = setInterval(() => {
                    const now = Date.now();
                    const diff = Math.max(0, Math.floor((state.targetTimestamp - now) / 1000));
                    document.getElementById('time-badge-container').innerHTML = `Noch <span id="time-display">${diff}</span> Sek.`;
                    
                    if (diff <= 0) clearInterval(localTimerInterval);
                }, 1000);
            }
        }
    }
});

function renderVotingList(songs) {
    const list = document.getElementById('voting-list');
    list.innerHTML = '';
    
    if (songs.length === 0) {
        list.innerHTML = '<li style="justify-content: center; color: #888;">Noch keine Songs eingereicht</li>';
        return;
    }

    songs.forEach(song => {
        const li = document.createElement('li');
        const displayText = song.link.split("track/")[1] ? "🟢 Track: ..." + song.link.split("track/")[1].substring(0,6) : "🎵 Spotify Link";
        
        li.innerHTML = `
            <span title="${song.link}">${displayText}</span>
            <button onclick="vote('${song.id}')" ${hasVoted ? 'disabled' : ''}>
                Vote (${song.votes})
            </button>
        `;
        list.appendChild(li);
    });
}

function submitSong() {
    if (hasSubmitted && !isVotingDisabledCurrently) return;
    
    const input = document.getElementById('song-input');
    const link = input.value.trim();
    
    if (!link.includes("spotify.com")) {
        alert("Bitte gib einen gültigen Spotify Link ein!");
        return;
    }

    pubnub.publish({
        channel: APP_CONFIG.CHANNELS.ACTION,
        message: { action: 'SUBMIT', link: link }
    });
    
    if (!isVotingDisabledCurrently) {
        hasSubmitted = true;
        document.getElementById('submit-btn').disabled = true;
    }
    
    input.value = '';
    
    if (isVotingDisabledCurrently) {
        alert("Song wurde direkt an den DJ geschickt!");
    }
}

function vote(songId) {
    if (hasVoted || isVotingDisabledCurrently) return;
    pubnub.publish({
        channel: APP_CONFIG.CHANNELS.ACTION,
        message: { action: 'VOTE', id: songId }
    });
    hasVoted = true;
}

