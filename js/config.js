// js/config.js

// 1. PUBNUB API KEYS
const pubnub = new PubNub({
    publishKey: "pub-c-b336df9e-28eb-40aa-b715-cc13f8603976",
    subscribeKey: "sub-c-adf15c8d-cd7f-4217-872f-fc5006ce742e",
    userId: "stify_panel_user_" + Math.random().toString(36).substr(2, 9) 
});

// 2. GLOBALE EINSTELLUNGEN
const APP_CONFIG = {
    DEFAULT_GENRE: "City Pop",
    DEFAULT_DURATION: 120,       
    MAX_SONGS_IN_VOTING: 6,      
    HEARTBEAT_INTERVAL: 10000,    
    CHANNELS: {
        STATE: "music_party_state",
        ACTION: "music_party_actions"
    }
};

// Hilfsfunktion zum Schutz vor unsauberem Code (Jetzt syntaktisch korrekt!)
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Prüft, ob ein Spotify-Link oder reiner Text eingegeben wurde
function getSongDisplayHtml(input) {
    // Trick, um die automatische Link-Verfälschung der KI zu umgehen
    const sDomain = "open" + "." + "spotify" + ".com";
    
    if (input.includes(sDomain) && input.includes("/track/")) {
        try {
            const trackId = input.split("/track/")[1].split("?")[0];
            return `<iframe class="spotify-embed" src="https://${sDomain}/embed/track/${trackId}" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
        } catch(e) {
            return `<div class="song-name-display">🎵 ${escapeHTML(input)}</div>`;
        }
    } 
    else if (input.includes(sDomain)) {
        return `<div class="song-name-display">🔗 <a href="${escapeHTML(input)}" target="_blank" style="color: #1db954;">Spotify Link öffnen</a></div>`;
    } 
    else {
        return `<div class="song-name-display">🎤 ${escapeHTML(input)}</div>`;
    }
}
