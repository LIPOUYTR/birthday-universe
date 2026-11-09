import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// A lightweight Three.js star field and orbit add real 3D depth to the hero.
const canvas = document.querySelector('#three-bg');
if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 13;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const resizeScene = () => {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
  };
  resizeScene(); window.addEventListener('resize', resizeScene);
  const positions = new Float32Array(420 * 3);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (Math.random() - .5) * 24;
    positions[i + 1] = (Math.random() - .5) * 15;
    positions[i + 2] = (Math.random() - .5) * 12;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xe9b8d0, size: .035, transparent: true, opacity: .8 }));
  scene.add(stars);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.1, .008, 8, 180), new THREE.MeshBasicMaterial({ color: 0xc5a6df, transparent: true, opacity: .32 }));
  ring.position.set(3.2, -.1, -2); ring.rotation.set(.8, .4, -.35); scene.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.6, .006, 8, 180), new THREE.MeshBasicMaterial({ color: 0xe9a9c5, transparent: true, opacity: .2 }));
  ring2.position.copy(ring.position); ring2.rotation.set(1.1, -.4, .2); scene.add(ring2);
  const clock = new THREE.Clock();
  const animate3D = () => {
    const t = clock.getElapsedTime(); stars.rotation.y = t * .012; stars.rotation.x = Math.sin(t * .08) * .025;
    ring.rotation.z += .0007; ring2.rotation.z -= .00045;
    renderer.render(scene, camera); requestAnimationFrame(animate3D);
  };
  animate3D();
}

// PERSONALISE THIS FIRST: replace the title/name in index.html if you'd like.
const $ = (s) => document.querySelector(s);

// Soft pointer parallax on desktop; touch users get a gentle floating portrait.
const heroArt = $('#heroArt');
const glow = $('.cursor-glow');
if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - .5);
    const y = (event.clientY / window.innerHeight - .5);
    if (glow) { glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; }
    if (heroArt && window.innerWidth > 700) heroArt.style.transform = `translateY(-47%) rotateY(${x * 7}deg) rotateX(${-y * 5}deg)`;
  });
}

// Reveal sections as they enter the viewport.
document.querySelectorAll('.section-kicker, .intro h2, .intro-text, .section-heading, .memory-card, .birthday h2, .birthday-copy, .finale h2').forEach(el => el.classList.add('reveal'));
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

$('#enterButton').addEventListener('click', () => $('#story').scrollIntoView({ behavior: 'smooth' }));

// Photo lightbox.
const lightbox = $('#lightbox');
document.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', () => {
  $('#lightboxImage').src = card.dataset.full;
  lightbox.classList.add('open');
}));
function closeLightbox() { lightbox.classList.remove('open'); }
$('#lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLightbox(); });

// Tap each candle to extinguish it. The wish appears when all three are out.
const candles = [...document.querySelectorAll('.candle')];
candles.forEach(candle => candle.addEventListener('click', () => {
  candle.classList.add('out');
  if (candles.every(item => item.classList.contains('out'))) {
    $('#cakeInstruction').textContent = 'WISH SENT INTO THE UNIVERSE ✨';
    $('#wishMessage').classList.add('show');
    for (let i = 0; i < 18; i++) {
      const spark = document.createElement('span');
      spark.textContent = ['✦','✧','♡'][i % 3];
      spark.className = 'confetti';
      spark.style.cssText = `position:fixed;z-index:40;left:${Math.random()*100}vw;top:-20px;color:${i%2?'#f0a7bd':'#c4aaf0'};font-size:${12+Math.random()*18}px;pointer-events:none;animation:fall ${2+Math.random()*2}s linear forwards`;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 4200);
    }
  }
}));
const fallStyle = document.createElement('style');
fallStyle.textContent = '@keyframes fall{to{transform:translateY(110vh) rotate(540deg);opacity:0}}';
document.head.appendChild(fallStyle);

// Optional ambient sound is generated in-browser (no music file needed).
// Browsers require a tap before audio can start. This is a soft, quiet two-note pad.
let audioContext = null, soundOn = false, oscillators = [];
$('#soundToggle').addEventListener('click', async () => {
  const button = $('#soundToggle');
  if (!soundOn) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) { $('#soundLabel').textContent = 'NO AUDIO'; return; }
    audioContext = audioContext || new AudioCtx();
    await audioContext.resume();
    [220, 329.63].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.value = index ? .012 : .018;
      oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start();
      oscillators.push({ oscillator, gain });
    });
    soundOn = true; button.classList.add('active'); $('#soundLabel').textContent = 'SOUND ON';
  } else {
    oscillators.forEach(({ oscillator, gain }) => { gain.gain.setTargetAtTime(0, audioContext.currentTime, .08); oscillator.stop(audioContext.currentTime + .4); });
    oscillators = []; soundOn = false; button.classList.remove('active'); $('#soundLabel').textContent = 'SOUND OFF';
  }
});
