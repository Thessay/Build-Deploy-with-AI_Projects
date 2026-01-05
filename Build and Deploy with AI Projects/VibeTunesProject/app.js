// ===========================
// VibeTunes - Deezer UI Player
// (Uses Deezer JSONP to avoid browser CORS issues)
// ===========================

/* --------- Element refs (unique IDs) --------- */
const searchInput = document.getElementById("searchInput");

const songCover = document.getElementById("songCover");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");

const progressBarWrap = document.getElementById("progressBarWrap");
const progressFill = document.getElementById("progressFill");
const progressHandle = document.getElementById("progressHandle");

const currentTimeEl = document.getElementById("currentTime");
const durationTimeEl = document.getElementById("durationTime");
const statusText = document.getElementById("statusText");

const audioPlayer = document.getElementById("audioPlayer");

// Top track slots 1..5
const topTrackSlots = [1, 2, 3, 4, 5].map((i) => ({
  slotIndex: i,
  card: document.getElementById(`topTrackCard${i}`),
  cover: document.getElementById(`topTrackCover${i}`),
  name: document.getElementById(`topTrackName${i}`),
  artist: document.getElementById(`topTrackArtist${i}`),
}));

/* --------- State --------- */
let songs = [];        // array of {title, artist, preview, cover}
let currentIndex = 0;

/* --------- Helpers --------- */
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function setStatus(msg) {
  statusText.textContent = msg || "";
}

function setProgress(value01) {
  const v = Math.max(0, Math.min(1, value01));
  const pct = (v * 100).toFixed(2) + "%";
  progressFill.style.width = pct;
  progressHandle.style.left = pct;
}

function setNowPlaying(track) {
  if (!track) return;

  songTitle.textContent = track.title || "Unknown title";
  songArtist.textContent = track.artist || "Unknown artist";

  if (track.cover) songCover.src = track.cover;

  // Deezer preview is typically ~30s MP3
  audioPlayer.src = track.preview || "";
  audioPlayer.load();

  currentTimeEl.textContent = "0:00";
  durationTimeEl.textContent = "0:30"; // will update when metadata loads
  setProgress(0);

  setStatus(track.preview ? "Preview ready" : "No preview available for this track");
}

function playCurrent() {
  if (!songs.length) return;

  // ensure current track is loaded
  if (!audioPlayer.src) setNowPlaying(songs[currentIndex]);

  audioPlayer.play().then(() => {
    setStatus("Playing preview…");
  }).catch(() => {
    // Usually happens if browser blocks autoplay; but play button click is user interaction so should be fine.
    setStatus("Click Play to start audio (browser blocked autoplay).");
  });
}

function pauseCurrent() {
  audioPlayer.pause();
  setStatus("Paused");
}

function nextTrack() {
  if (!songs.length) return;

  currentIndex = (currentIndex + 1) % songs.length;
  setNowPlaying(songs[currentIndex]);
  playCurrent();
}

function renderTopTracks() {
  // Fill the 5 slots with first 5 songs
  topTrackSlots.forEach((slot, idx) => {
    const track = songs[idx];

    if (!track) {
      slot.card.style.display = "none";
      return;
    }

    slot.card.style.display = "";
    slot.cover.src = track.cover || slot.cover.src;
    slot.name.textContent = track.title || "Unknown";
    slot.artist.textContent = track.artist || "Unknown";

    slot.card.onclick = () => {
      currentIndex = idx;
      setNowPlaying(track);
      playCurrent();
    };
  });
}

/* --------- Deezer fetch via JSONP ---------
   Note: Deezer direct fetch is usually blocked by CORS in browsers.
------------------------------------------- */
function fetchDeezerSongs(query) {
  return new Promise((resolve, reject) => {
    const callbackName = `deezer_cb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");

    window[callbackName] = (data) => {
      cleanup();

      if (!data || !Array.isArray(data.data)) {
        reject(new Error("Unexpected Deezer response"));
        return;
      }

      const mapped = data.data.map((track) => ({
        title: track.title,
        artist: track.artist?.name,
        preview: track.preview,
        cover: track.album?.cover_medium || track.album?.cover || "",
      }));

      resolve(mapped);
    };

    function cleanup() {
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    script.onerror = () => {
      cleanup();
      reject(new Error("Failed to load Deezer JSONP script (network/CSP issue)."));
    };

    const q = encodeURIComponent(query);
    script.src = `https://api.deezer.com/search?q=${q}&output=jsonp&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

/* --------- Load a query --------- */
async function loadQuery(q) {
  const query = (q || "").trim() || "lofi";

  setStatus(`Loading "${query}"…`);
  songTitle.textContent = "Loading songs...";
  songArtist.textContent = "Please wait";

  try {
    const results = await fetchDeezerSongs(query);

    songs = results;
    currentIndex = 0;

    if (!songs.length) {
      setStatus(`No results for "${query}". Try another search.`);
      songTitle.textContent = "No songs found";
      songArtist.textContent = "Try another query";
      renderTopTracks();
      return;
    }

    // Update UI
    renderTopTracks();
    setNowPlaying(songs[0]);
    setStatus(`Loaded ${songs.length} results for "${query}". Tap a track to play.`);
  } catch (err) {
    console.error(err);
    setStatus("Couldn’t load songs. Check console for details.");
    songTitle.textContent = "Couldn’t load songs";
    songArtist.textContent = "Check console (network/CSP/CORS)";
  }
}

/* --------- Events --------- */
playBtn.addEventListener("click", playCurrent);
pauseBtn.addEventListener("click", pauseCurrent);
nextBtn.addEventListener("click", nextTrack);

// Click-to-seek on progress bar
progressBarWrap.addEventListener("click", (e) => {
  if (!audioPlayer.duration || !Number.isFinite(audioPlayer.duration)) return;

  const rect = progressBarWrap.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;

  audioPlayer.currentTime = Math.max(
    0,
    Math.min(audioPlayer.duration, ratio * audioPlayer.duration)
  );
});

// Update progress UI while playing
audioPlayer.addEventListener("loadedmetadata", () => {
  durationTimeEl.textContent = formatTime(audioPlayer.duration || 30);
});

audioPlayer.addEventListener("timeupdate", () => {
  const ct = audioPlayer.currentTime || 0;
  const dur = audioPlayer.duration || 30;

  currentTimeEl.textContent = formatTime(ct);
  durationTimeEl.textContent = formatTime(dur);

  setProgress(dur ? ct / dur : 0);
});

// Auto-next when preview ends
audioPlayer.addEventListener("ended", () => {
  nextTrack();
});

// Search debounce (type genre: lofi, pop, rock...)
let searchTimer = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    loadQuery(searchInput.value);
  }, 450);
});

/* --------- Init --------- */
loadQuery("lofi");