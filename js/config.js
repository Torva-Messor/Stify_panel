// js/config.js

// 1. PUBNUB API KEYS (Hier einfach austauschen)
const PUBNUB_PUBLISH_KEY = "DEIN_PUBNUB_PUBLISH_KEY";
const PUBNUB_SUBSCRIBE_KEY = "DEIN_PUBNUB_SUBSCRIBE_KEY";

// 2. GLOBALE EINSTELLUNGEN (Zentral steuerbar)
const APP_CONFIG = {
    DEFAULT_GENRE: "City Pop",
    DEFAULT_DURATION: 120,       // Standard Rundenzeit in Sekunden (2 Minuten)
    MAX_SONGS_IN_VOTING: 6,      // Maximale Anzahl an Songs, die gleichzeitig im Voting stehen dürfen
    HEARTBEAT_INTERVAL: 5000,    // Synchronisations-Takt in ms (5000ms = 5s schont das Free-Limit extrem!)
    
    // PubNub Kanäle
    CHANNELS: {
        STATE: "music_party_state",    // Kanal: Admin sendet Status & Timer an alle User
        ACTION: "music_party_actions"  // Kanal: User senden Votes & Song-Vorschläge an Admin
    }
};

// 3. PUBNUB INSTANZ (Wird automatisch von admin.js und user.js verwendet)
const pubnub = new PubNub({
    publishKey: PUBNUB_PUBLISH_KEY,
    subscribeKey: PUBNUB_SUBSCRIBE_KEY,
    userId: "party_user_" + Math.random().toString(36).substr(2, 9)
});

