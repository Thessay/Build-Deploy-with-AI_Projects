# VibeTunes – Technical Specification

## Overview
VibeTunes is a modern, dark-themed music player web app that fetches real music data from Deezer and allows users to preview tracks.

---

## Features
- Search music by keyword or genre
- Fetch real tracks from Deezer
- Play / Pause / Next controls
- Audio preview playback
- Progress bar with time tracking
- Top Tracks horizontal carousel
- Responsive mobile-first design
- Dark UI with glowing accents

---

## UI Components
- Header (App name + search input)
- Player card
  - Album cover
  - Track title
  - Artist name
  - Playback buttons
  - Progress bar
- Top Tracks section
- Hidden HTML `<audio>` element

---

## External APIs
**Deezer Public Search API**
- Endpoint: `https://api.deezer.com/search?q={query}`
- Access method: JSONP (CORS-safe)
- Used fields:
  - `track.title`
  - `track.artist.name`
  - `track.preview`
  - `track.album.cover`

---

## Key JavaScript Functions
- `fetchDeezerSongs(query)`
- `setNowPlaying(track)`
- `playCurrent()`
- `pauseCurrent()`
- `nextTrack()`
- `renderTopTracks()`
- `formatTime(seconds)`

---

## Loading States
- Display loading text while fetching songs
- Disable controls until preview is available

---

## Error Handling
- Graceful fallback if:
  - API request fails
  - No preview URL exists
  - No search results found
- Console logging for debugging

---

## Keyboard Shortcuts
- `Enter` → Search songs
- (Optional extension) `Space` → Play / Pause
