
---

# VibeFlix (Movie App)

## `vibeflix/spec.md`

```md
# VibeFlix – Technical Specification

## Overview
VibeFlix is a Netflix-inspired movie browsing app that displays real movie data from TMDb using a modern UI.

---

## Features
- Trending, Top Rated, and Popular movie rows
- Movie search
- Hero banner
- Modal with movie details
- Horizontal scrolling carousels
- Dark / Light theme toggle

---

## UI Components
- Sticky navigation bar
- Search input
- Hero section
- Movie rows (horizontal rails)
- Movie cards (poster + rating)
- Modal dialog

---

## External APIs
**The Movie Database (TMDb) API**
- Authentication: Bearer Token (v4)
- Endpoints:
  - `/trending/movie/week`
  - `/movie/top_rated`
  - `/movie/popular`
  - `/search/movie`
- Images:
  - `https://image.tmdb.org/t/p/w500`

---

## Key JavaScript Functions
- `tmdbFetch(path, params)`
- `loadHomeRows()`
- `renderHero(movie)`
- `renderRow(rail, movies)`
- `runSearch()`
- `openModal(movie)`
- `closeModal()`
- `setTheme(theme)`

---

## Loading States
- Initial loading of movie rows
- Search loading debounce
- Placeholder UI while fetching

---

## Error Handling
- Token validation on startup
- Poster fallback SVG if image missing
- Friendly hero message if API fails
- Console error logging

---

## Keyboard Shortcuts
- `Enter` → Search movies
- `Escape` → Close modal
