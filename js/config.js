// js/config.js

// 1. PUBNUB API KEYS (Jetzt erfolgreich für dich eingetragen!)
const pubnub = new PubNub({
    publishKey: "pub-c-83becc1c-68f4-47bc-8d66-c2c6fd516421",
    subscribeKey: "sub-c-2f78ee6d-c74f-499a-8f00-7ba94823ae4a",
    userId: "stify_panel_user_" + Math.random().toString(36).substr(2, 9) // Erzeugt eine zufällige ID für jeden Client
});

// 2. GLOBALE EINSTELLUNGEN
const APP_CONFIG = {
    DEFAULT_GENRE: "City Pop",
    DEFAULT_DURATION: 120,       // Rundenzeit in Sekunden
    MAX_SONGS_IN_VOTING: 6,      // Maximale Anzahl an Songs im Voting
    HEARTBEAT_INTERVAL: 2000,    // Synchronisations-Takt (alle 2 Sek.)
    
    // PubNub Kanäle
    CHANNELS: {
        STATE: "music_party_state",
        ACTION: "music_party_actions"
    }
};

// 3. PUBNUB INSTANZ
const pubnub = new PubNub({
    publishKey: PUBNUB_PUBLISH_KEY,
    subscribeKey: PUBNUB_SUBSCRIBE_KEY,
    userId: "party_user_" + Math.random().toString(36).substr(2, 9)
});

// Hilfsfunktion zum Schutz vor unsauberem Code bei der Texteingabe
function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Prüft, ob ein Spotify-Link oder reiner Text eingegeben wurde
function getSongDisplayHtml(input) {
    // Prüfen, ob es ein echter Spotify Track-Link ist
    if (input.includes("spotify.com") && input.includes("/track/")) {
        try {
            // Extrahiert die Song-ID aus dem Link
            const trackId = input.split("/track/")[1].split("?")[0];
            return `<iframe class="spotify-embed" src="https://open.spotify.com/embed/track/${trackId}" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
        } catch(e) {
            return `<div class="song-name-display">🎵 ${escapeHTML(input)}</div>`;
        }
    } 
    // Falls es ein anderer Spotify-Link (z.B. Playlist oder Album) ist
    else if (input.includes("spotify.com")) {
        return `<div class="song-name-display">🔗 <a href="${escapeHTML(input)}" target="_blank" style="color: #1db954;">Spotify Link öffnen</a></div>`;
    } 
    // Wenn es einfach nur Text / ein reiner Liedname ist
    else {
        return `<div class="song-name-display">🎤 ${escapeHTML(input)}</div>`;
    }
}
