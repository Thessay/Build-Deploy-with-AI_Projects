# VibeFlix 🎬

A Netflix-inspired movie browsing web app powered by **TMDb**, built with pure HTML, CSS, and JavaScript.

 **Technical Spec:**  
 [spec.md](./spec.md)

---

## Features
- Trending, Top Rated, Popular movie rows
- Movie search
- Hero banner
- Movie detail modal
- Horizontal scrolling rails
- Dark / Light theme toggle

---

## Installation
1. Clone or download the project
2. Open `index.html`

### TMDb Setup
1. Create a TMDb account
2. Generate a **Read Access Token (v4)**
3. Add it to `app.js`:

```js
const TMDB_BEARER_TOKEN = "YOUR_TMDB_TOKEN_HERE";
