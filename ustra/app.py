"""
Streamlit wrapper for the USTRA saloon site.

The site itself is plain HTML/CSS/JS (index.html, style.css, script.js) —
this file just embeds it full-bleed so it can be deployed on Streamlit
Community Cloud like your other builds. It changes nothing about the
site itself.

Run locally:
    pip install streamlit
    streamlit run app.py
"""
import base64
import json
import pathlib
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="USTRA — Classic Saloon", layout="wide")

# Streamlit adds its own padding/chrome by default — strip it so the
# saloon page can go edge-to-edge.
st.markdown(
    """
    <style>
        .block-container { padding: 0 !important; max-width: 100% !important; }
        header[data-testid="stHeader"] { display: none; }
        #MainMenu, footer { visibility: hidden; }
    </style>
    """,
    unsafe_allow_html=True,
)

BASE_DIR = pathlib.Path(__file__).parent
html = (BASE_DIR / "index.html").read_text(encoding="utf-8")
css = (BASE_DIR / "style.css").read_text(encoding="utf-8")
js = (BASE_DIR / "script.js").read_text(encoding="utf-8")

# Inline the CSS/JS so components.html (which sandboxes the iframe and
# can't resolve relative <link>/<script> file paths) renders identically
# to opening index.html directly in a browser.
html = html.replace('<link rel="stylesheet" href="style.css" />', f"<style>{css}</style>")

# Streamlit's components.html doesn't serve local files at a relative path
# like "audio/track-1.mp3" the way a normal web server would — the iframe
# has nowhere to fetch them from, so the player just goes silent. Instead,
# read any MP3s that exist in /audio and embed them directly into the page
# as base64 data URIs. script.js picks this up automatically via
# window.USTRA_AUDIO_OVERRIDE if it's set (see the playlist comment there).
DEFAULT_META = [
    {"title": "Yaadon Ki Gali", "artist": "Old Radio Sessions"},
    {"title": "Chandni Raat", "artist": "Retro Waves"},
    {"title": "Sham-e-Mehfil", "artist": "Old Radio Sessions"},
]
audio_dir = BASE_DIR / "audio"
audio_override = []
if audio_dir.exists():
    for i, f in enumerate(sorted(audio_dir.glob("track-*.mp3"))):
        b64 = base64.b64encode(f.read_bytes()).decode("ascii")
        meta = DEFAULT_META[i] if i < len(DEFAULT_META) else {"title": f.stem, "artist": "USTRA"}
        audio_override.append({**meta, "src": f"data:audio/mpeg;base64,{b64}"})

override_script = f"<script>window.USTRA_AUDIO_OVERRIDE = {json.dumps(audio_override)};</script>"
html = html.replace('<script src="script.js"></script>', f"{override_script}\n<script>{js}</script>")

components.html(html, height=1400, scrolling=True)

if not audio_override:
    st.caption(
        "No tracks found yet — add licensed 90s Bollywood/Indipop MP3s to the "
        "/audio folder next to this file, named track-1.mp3, track-2.mp3, "
        "track-3.mp3, then redeploy. They'll be embedded automatically."
    )
