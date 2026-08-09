# USTRA — Classic Indian Saloon

Single-page site. Vanilla HTML/CSS/JS, no build step, no dependencies.

## Files
- `index.html` — structure
- `style.css` — day/night theme, layout, animation
- `script.js` — loader, theme toggle, particles, flip cards, before/after
  slider, booking form, music player
- `app.py` — optional Streamlit wrapper (see below)
- `audio/` — empty; add your own MP3s here (see below)

## Running it
Just open `index.html` in a browser, or serve the folder with anything
static (`python3 -m http.server`, Netlify, GitHub Pages, etc).

To run inside Streamlit instead:
```
pip install streamlit
streamlit run app.py
```

## About the music
Real 90s Bollywood/Indipop tracks are copyrighted, so no actual song
files are bundled — the player, playlist UI, seek bar, volume, vinyl
spin and visualizer are all fully wired up and just need audio.

Drop your own **licensed** MP3s into `/audio` using these filenames
(or edit the `src` values in the `DATA.playlist` array at the top of
`script.js`):

```
audio/track-1.mp3
audio/track-2.mp3
audio/track-3.mp3
```

Until then, the player shows "Add your MP3s" and stays silent — it
won't throw errors, it just waits for files.

The ambient "shop sound" toggle (scissors icon, bottom-right of the
player) doesn't need any files — that scissor-snip sound is synthesized
live with the Web Audio API.

## Accessibility & performance notes
- Respects `prefers-reduced-motion` (disables petals, scroll-reveal, curtain skips straight to open)
- All interactive controls are keyboard-reachable with visible focus states
- No external image assets — the shopfront scene, posters and before/after
  photos are all CSS/SVG, so there's nothing to license or optimize
