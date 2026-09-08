// Get all pads and audio elements
const pads = document.querySelectorAll('.pad');
const audios = document.querySelectorAll('audio');

// Helper: play sound by key
function playSoundByKey(key) {
  const audio = document.querySelector(`audio[data-key="${key}"]`);
  const pad = document.querySelector(`.pad[data-key="${key}"]`);
  if (!audio) return;

  // Restart sound if already playing
  audio.currentTime = 0;
  audio.play();

  // Visual feedback
  if (pad) {
    pad.classList.add('active');
    setTimeout(() => pad.classList.remove('active'), 120);
  }
}

// Keyboard events
window.addEventListener('keydown', (e) => {
  // Use e.key for modern approach; you can also use e.keyCode if needed
  const key = e.key.toUpperCase();
  playSoundByKey(key);
});

// Mouse click events on pads
pads.forEach((pad) => {
  pad.addEventListener('click', function () {
    const key = this.getAttribute('data-key');
    playSoundByKey(key);
  });
});