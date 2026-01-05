// ==========================
// VibeFlix (Netflix-inspired UI)
// TMDb-powered rows + search + modal + theme toggle
// ==========================

const THEME_KEY = "thessflix_theme_v1";

// ✅ 1) PUT YOUR TMDb READ ACCESS TOKEN (v4 auth token) HERE
// Example: "eyJhbGciOiJIUzI1NiJ9...."
const TMDB_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YjUyMGMyNzZkZDAwZjFhNjU3YzA5OWFmMDQ0ZDVmMSIsIm5iZiI6MTc2NzU4NzgyOC4yNDgsInN1YiI6IjY5NWIzZmY0M2VkZTg5OGI2NWMzNzM4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.7mIhQGuzxbpmaLqQ-d2cHamIJZOKnKsZglqzHmSaB-Q";

// TMDb config
const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w500"; // poster sizes: w92/w154/w185/w342/w500/original

// Elements
const themeToggleBtn = document.getElementById("themeToggleBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const heroInfoBtn = document.getElementById("heroInfoBtn");

const row1Rail = document.getElementById("row1Rail");
const row2Rail = document.getElementById("row2Rail");
const row3Rail = document.getElementById("row3Rail");

const row1PrevBtn = document.getElementById("row1PrevBtn");
const row1NextBtn = document.getElementById("row1NextBtn");
const row2PrevBtn = document.getElementById("row2PrevBtn");
const row2NextBtn = document.getElementById("row2NextBtn");
const row3PrevBtn = document.getElementById("row3PrevBtn");
const row3NextBtn = document.getElementById("row3NextBtn");

// Hero elements (from your HTML)
const heroTitleEl = document.getElementById("heroTitle");
const heroDescEl = document.getElementById("heroDesc");
const heroTagEl = document.getElementById("heroTag");
const heroMetaEl = document.getElementById("heroMeta");

// Modal
const modalOverlay = document.getElementById("modalOverlay");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalMeta = document.getElementById("modalMeta");

// In-memory state
let heroMovie = null;
let row1Movies = []; // Trending
let row2Movies = []; // Top Rated
let row3Movies = []; // Popular

// ----------------- Theme -----------------
function getTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "light" ? "light" : "dark";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "🌙" : "☀️";
  localStorage.setItem(THEME_KEY, theme);
}

// ----------------- TMDb Helpers -----------------
function assertToken() {
  if (!TMDB_BEARER_TOKEN || TMDB_BEARER_TOKEN.includes("PASTE_YOUR")) {
    throw new Error(
      "TMDb token missing. Set TMDB_BEARER_TOKEN at the top of app.js."
    );
  }
}

async function tmdbFetch(path, params = {}) {
  assertToken();

  const url = new URL(`${TMDB_API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) {
      url.searchParams.set(k, v);
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`TMDb error ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}

function posterUrl(posterPath) {
  return posterPath ? `${TMDB_IMG_BASE}${posterPath}` : null;
}

function safeText(v) {
  return (v ?? "").toString();
}

function formatYear(dateStr) {
  // "YYYY-MM-DD" -> "YYYY"
  if (!dateStr || typeof dateStr !== "string") return "";
  const y = dateStr.split("-")[0];
  return /^\d{4}$/.test(y) ? y : "";
}

function toMovieCardModel(m) {
  // Normalize TMDb movie object to what our UI expects
  const title = m.title || m.name || m.original_title || m.original_name || "Untitled";
  const ratingNum = typeof m.vote_average === "number" ? m.vote_average : null;
  const rating = ratingNum ? ratingNum.toFixed(1) : "—";

  return {
    id: m.id,
    title,
    rating,
    voteAverage: ratingNum,
    poster_path: m.poster_path || null,
    overview: m.overview || "",
    release_date: m.release_date || m.first_air_date || "",
  };
}

function makePosterFallbackDataUri(title) {
  const safe = safeText(title).replace(/[<>&"]/g, "");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#111827"/>
        <stop offset="1" stop-color="#0b0b0f"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="100" cy="120" r="90" fill="rgba(229,9,20,0.20)"/>
    <circle cx="320" cy="520" r="120" fill="rgba(255,43,106,0.14)"/>
    <text x="50%" y="56%" text-anchor="middle" fill="rgba(245,245,247,0.75)"
      font-family="Arial" font-size="18" font-weight="700">${safe}</text>
    <text x="50%" y="62%" text-anchor="middle" fill="rgba(245,245,247,0.45)"
      font-family="Arial" font-size="12">Poster unavailable</text>
  </svg>`.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// ----------------- UI Build -----------------
function buildCard(movie, index, rowId) {
  const card = document.createElement("article");
  card.className = "movieCard";
  card.id = `${rowId}_card_${index}`; // unique
  card.tabIndex = 0;

  const img = document.createElement("img");
  img.className = "moviePoster";
  img.id = `${rowId}_poster_${index}`;
  img.alt = `${movie.title} poster`;

  const src = posterUrl(movie.poster_path);
  img.src = src || makePosterFallbackDataUri(movie.title);
  img.onerror = () => (img.src = makePosterFallbackDataUri(movie.title));

  const overlay = document.createElement("div");
  overlay.className = "movieOverlay";
  overlay.id = `${rowId}_overlay_${index}`;

  const name = document.createElement("p");
  name.className = "movieName";
  name.id = `${rowId}_name_${index}`;
  name.textContent = movie.title;

  const meta = document.createElement("div");
  meta.className = "movieMeta";
  meta.id = `${rowId}_meta_${index}`;

  const rating = document.createElement("span");
  rating.className = "movieRating";
  rating.id = `${rowId}_rating_${index}`;
  rating.textContent = movie.voteAverage ? `★ ${movie.rating}` : "★ —";

  const pill = document.createElement("span");
  pill.className = "moviePill";
  pill.id = `${rowId}_pill_${index}`;
  pill.textContent = rowId === "row1" ? "Trending" : rowId === "row2" ? "Top Rated" : "Popular";

  meta.appendChild(rating);
  meta.appendChild(pill);

  overlay.appendChild(name);
  overlay.appendChild(meta);

  card.appendChild(img);
  card.appendChild(overlay);

  card.addEventListener("click", () => openModal(movie));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openModal(movie);
  });

  return card;
}

function renderRow(railEl, rowId, movies) {
  railEl.innerHTML = "";
  movies.forEach((m, i) => railEl.appendChild(buildCard(m, i + 1, rowId)));
}

function openModal(movie) {
  modalTitle.textContent = movie.title;

  const overview = movie.overview?.trim() || "No description available.";
  modalText.textContent = overview;

  const year = formatYear(movie.release_date);
  const rating = movie.voteAverage ? `★ ${movie.rating}` : "★ —";
  modalMeta.textContent = `${year ? year + " • " : ""}${rating}`;

  modalOverlay.classList.add("is-open");
  modalOverlay.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modalOverlay.classList.remove("is-open");
  modalOverlay.setAttribute("aria-hidden", "true");
}

function scrollRail(rail, dir) {
  rail.scrollBy({ left: dir * 420, behavior: "smooth" });
}

// ----------------- Data Load -----------------
async function loadHomeRows() {
  // 3 Rails:
  // Row 1: Trending
  // Row 2: Top Rated
  // Row 3: Popular
  const [trending, topRated, popular] = await Promise.all([
    tmdbFetch("/trending/movie/week", { language: "en-US" }),
    tmdbFetch("/movie/top_rated", { language: "en-US", page: "1" }),
    tmdbFetch("/movie/popular", { language: "en-US", page: "1" }),
  ]);

  row1Movies = (trending.results || []).map(toMovieCardModel).slice(0, 16);
  row2Movies = (topRated.results || []).map(toMovieCardModel).slice(0, 16);
  row3Movies = (popular.results || []).map(toMovieCardModel).slice(0, 16);

  renderRow(row1Rail, "row1", row1Movies);
  renderRow(row2Rail, "row2", row2Movies);
  renderRow(row3Rail, "row3", row3Movies);

  // Pick a hero movie from trending
  heroMovie = row1Movies[0] || row2Movies[0] || row3Movies[0] || null;
  renderHero(heroMovie);
}

function renderHero(movie) {
  if (!movie) return;

  // Keep your existing backdrop styling (CSS), just update the text
  heroTagEl.textContent = "Trending This Week";
  heroTitleEl.textContent = movie.title;

  const desc = movie.overview?.trim();
  heroDescEl.textContent = desc ? desc : "Discover something new to watch today.";

  const year = formatYear(movie.release_date);
  const rating = movie.voteAverage ? `★ ${movie.rating}` : "★ —";
  heroMetaEl.textContent = `${year ? year + " • " : ""}${rating}`;
}

// ----------------- Search -----------------
let searchTimer = null;

async function runSearch() {
  const q = (searchInput.value || "").trim();
  if (!q) {
    // If empty search, restore home rows
    renderRow(row1Rail, "row1", row1Movies);
    renderRow(row2Rail, "row2", row2Movies);
    renderRow(row3Rail, "row3", row3Movies);
    return;
  }

  const data = await tmdbFetch("/search/movie", {
    query: q,
    include_adult: "false",
    language: "en-US",
    page: "1",
  });

  const results = (data.results || []).map(toMovieCardModel);

  // Fill all three rows with different slices for variety
  renderRow(row1Rail, "row1", results.slice(0, 16));
  renderRow(row2Rail, "row2", results.slice(4, 20));
  renderRow(row3Rail, "row3", results.slice(8, 24));

  // Update hero to first search result
  renderHero(results[0] || heroMovie);
}

// ----------------- Events -----------------
themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

searchBtn.addEventListener("click", () => {
  runSearch().catch((e) => console.error(e));
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runSearch().catch((err) => console.error(err));
  }
});

// Optional: debounced live search
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    runSearch().catch((err) => console.error(err));
  }, 350);
});

heroInfoBtn.addEventListener("click", () => {
  if (heroMovie) openModal(heroMovie);
});

modalCloseBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Row scroll buttons
row1PrevBtn.addEventListener("click", () => scrollRail(row1Rail, -1));
row1NextBtn.addEventListener("click", () => scrollRail(row1Rail, 1));
row2PrevBtn.addEventListener("click", () => scrollRail(row2Rail, -1));
row2NextBtn.addEventListener("click", () => scrollRail(row2Rail, 1));
row3PrevBtn.addEventListener("click", () => scrollRail(row3Rail, -1));
row3NextBtn.addEventListener("click", () => scrollRail(row3Rail, 1));

// ----------------- Init -----------------
(function init() {
  setTheme(getTheme());

  loadHomeRows().catch((err) => {
    console.error(err);

    // If token missing or API fails, show a friendly message in hero area
    heroTagEl.textContent = "Setup needed";
    heroTitleEl.textContent = "TMDb not connected";
    heroDescEl.textContent =
      "Add your TMDb Read Access Token to TMDB_BEARER_TOKEN in app.js, then refresh.";
    heroMetaEl.textContent = "";
  });
})();
