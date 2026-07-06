// js/user.js
let hasVoted = false;
let hasSubmitted = false;
let localTimerInterval = null;
let currentRoundId = null;
let isVotingDisabledCurrently = false;

pubnub.subscribe({ channels: [APP_CONFIG.CHANNELS.STATE] });

pubnub.addListener({
    message: function(event) {
        if (event.channel === APP_CONFIG.CHANNELS.STATE) {
            const state = event.message;
            isVotingDisabledCurrently = state.votingDisabled;

            document.getElementById('genre-display').innerText = state.genre;

            if (state.votingDisabled) {
                clearInterval(localTimerInterval);
                document.getElementById('time-badge-container').innerHTML = "<span style='color: #00bcd4;'>🚀 Direkt-Modus aktiv!</span><br><small style='font-size:0.8rem; color:#aaa;'>Wünsche gehen sofort an den DJ</small>";
                document.getElementById('list-title').innerText = "Warteschlange aktiv";
                document.getElementById('submit-title').innerText = "Song direkt an den DJ senden";
                document.getElementById('submit-btn').disabled = false;
                document.getElementById('voting-list').innerHTML = '<li style="justify-content: center; color: #888; text-align:center; padding: 15px;">Schicke deine Songwünsche oben ab!</li>';
            } else {
                document.getElementById('list-title').innerText = `Aktuelle Auswahl (Max ${APP_CONFIG.MAX_SONGS_IN_VOTING})`;
                document.getElementById('submit-title').innerText = "Song wünschen";

                if (currentRoundId !== state.roundId) {
                    currentRoundId = state.roundId;
                    hasVoted = false;
                    hasSubmitted = false;
                    document.getElementById('submit-btn').disabled = false;
                }

                renderVotingList(state.songs);
                
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
        list.innerHTML = '<li style="justify-content: center; color: #888; text-align:center; padding: 15px;">Noch keine Songs eingereicht</li>';
        return;
    }

    songs.forEach(song => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <div style="padding: 5px 0;">
                ${getSongDisplayHtml(song.link)}
            </div>
            <div style="text-align: right; margin-top: 5px;">
                <button onclick="vote('${song.id}')" ${hasVoted ? 'disabled' : ''} style="width: auto; display: inline-block; padding: 6px 15px;">
                    Vote (${song.votes})
                </button>
            </div>
        `;
        list.appendChild(li);
    });
}

function submitSong() {
    if (hasSubmitted && !isVotingDisabledCurrently) return;
    
    const input = document.getElementById('song-input');
    const inputVal = input.value.trim();
    
    if (inputVal === "") {
        alert("Bitte gib einen Songnamen oder Spotify Link ein!");
        return;
    }

    pubnub.publish({
        channel: APP_CONFIG.CHANNELS.ACTION,
        message: { action: 'SUBMIT', link: inputVal }
    });
    
    if (!isVotingDisabledCurrently) {
        hasSubmitted = true;
        document.getElementById('submit-btn').disabled = true;
    }
    
    input.value = '';
    
    if (isVotingDisabledCurrently) {
        alert("Wunsch wurde direkt an den DJ geschickt!");
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
