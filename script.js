let paragraph =
"Breathing, hesitation or anticipation,\nrarely survive digital translation.\nCommunication became faster, \nbut it also became thinner..... \nCan technology be designed \nto amplify our rhythms???";
let letters = [];
let fallingLetters = [];
let heroCanvas;

const palette = [
"#a34735",
"#b6522c",
"#c35c20",
"#9f4b39",
"#d119c7"
];

const SETTLE_DELAY_MS = 2000;

function setup() {
const heroContainer = document.getElementById("p5-hero");
heroCanvas = createCanvas(heroContainer.offsetWidth, heroContainer.offsetHeight);
heroCanvas.parent("p5-hero");

textFont("Cooper Old Style");
textAlign(LEFT, TOP);
textSize(getResponsiveTextSize());

layoutText();
}

function draw() {
background("#000000");
drawStaticLetters();
updateAndDrawFallingLetters();
}

function drawStaticLetters() {
noStroke();

for (const l of letters) {
fill(l.color);
text(l.char, l.x, l.y);
}
}

function updateAndDrawFallingLetters() {
const now = millis();

for (let i = 0; i < fallingLetters.length; i++) {
let f = fallingLetters[i];

if (!f.locked) {
f.vy += 0.42;
f.y += f.vy;
f.angle += f.vr;
f.vx *= 0.992;
f.x += f.vx;
}

let supported = false;

for (let j = 0; j < fallingLetters.length; j++) {
if (i === j) continue;

let other = fallingLetters[j];
if (!other.locked && !other.resting) continue;

let horizontalOverlap = abs((f.x + f.w * 0.5) - (other.x + other.w * 0.5)) < max(f.w, other.w) * 0.65;
let landing = f.y + f.h > other.y && f.y < other.y && horizontalOverlap;

if (landing && f.vy >= 0) {
f.y = other.y - f.h;
f.vy *= -0.22;
f.vx *= 0.86;
f.vr *= 0.82;
supported = true;

if (!f.groundedAt) {
f.groundedAt = now;
}
break;
}
}

if (f.y + f.h >= height) {
f.y = height - f.h;
f.vy *= -0.22;
f.vx *= 0.84;
f.vr *= 0.8;
supported = true;

if (!f.groundedAt) {
f.groundedAt = now;
}
}

if (!supported) {
f.resting = false;
f.groundedAt = null;
} else {
f.resting = true;
}

if (f.groundedAt && now - f.groundedAt > SETTLE_DELAY_MS) {
f.vx = lerp(f.vx, 0, 0.12);
f.vy = lerp(f.vy, 0, 0.18);
f.vr = lerp(f.vr, 0, 0.12);
f.angle = lerp(f.angle, 0, 0.08);

if (abs(f.vx) < 0.04 && abs(f.vy) < 0.04 && abs(f.vr) < 0.002 && abs(f.angle) < 0.01) {
f.vx = 0;
f.vy = 0;
f.vr = 0;
f.angle = 0;
f.locked = true;
}
}

if (f.x < 0) {
f.x = 0;
f.vx *= -0.25;
}

if (f.x + f.w > width) {
f.x = width - f.w;
f.vx *= -0.25;
}

push();
translate(f.x, f.y);
rotate(f.angle);
fill(f.color);
noStroke();
text(f.char, 0, 0);
pop();
}
}

function layoutText() {
letters = [];
fallingLetters = [];

textSize(getResponsiveTextSize());

const config = getLayoutConfig();
let x = config.startX;
let y = config.startY;

for (let i = 0; i < paragraph.length; i++) {
const char = paragraph[i];

if (char === "\n") {
x = config.startX;
y += config.lineHeight;
continue;
}

const w = textWidth(char);

if (x + w > width - config.rightMargin) {
x = config.startX;
y += config.lineHeight;
}

letters.push({
char,
x,
y,
w,
h: config.fontSize * 0.88,
color: getLetterColor(i, char)
});

x += w;
}
}

function getLayoutConfig() {
const fontSize = getResponsiveTextSize();

if (window.innerWidth < 480) {
return {
fontSize,
startX: 14,
startY: 90,
rightMargin: 17,
lineHeight: fontSize * 2
};
}

if (window.innerWidth < 640) {
return {
fontSize,
startX: 18,
startY: 110,
rightMargin: 16,
lineHeight: fontSize * 0.9
};
}

if (window.innerWidth < 980) {
return {
fontSize,
startX: 22,
startY: 128,
rightMargin: 22,
lineHeight: fontSize * 0.88
};
}

if (window.innerWidth < 1400) {
return {
fontSize,
startX: 28,
startY: 116,
rightMargin: 28,
lineHeight: fontSize * 0.85
};
}

return {
fontSize,
startX: 34,
startY: 120,
rightMargin: 34,
lineHeight: fontSize * 0.84
};
}

function getResponsiveTextSize() {
if (window.innerWidth < 480) return 24;
if (window.innerWidth < 640) return 32;
if (window.innerWidth < 980) return 48;
if (window.innerWidth < 1400) return 90;
return 108;
}

function getLetterColor(index, char) {
if (char.trim() === "") return "#a34735";

const normalized = paragraph.toLowerCase();

if (normalized.slice(index, index + 7) === "thinner") return "#b44a00";

const cycle = [
"#a34735",
"#b14d2f",
"#bc5427",
"#a84b36",
"#b95a1d"
];

return cycle[index % cycle.length];
}

function mousePressed() {
if (!isPointerInsideCanvas()) return;

const impactRadius = window.innerWidth < 640 ? 62 : 86;

for (let i = letters.length - 1; i >= 0; i--) {
const l = letters[i];
const d = dist(mouseX, mouseY, l.x, l.y);

if (d < impactRadius && random() < 0.6) {
fallingLetters.push({
char: l.char,
x: l.x,
y: l.y,
w: l.w,
h: l.h,
vx: random(-0.9, 0.9),
vy: random(2.8, 5.8),
angle: random(-0.22, 0.22),
vr: random(-0.045, 0.045),
resting: false,
locked: false,
groundedAt: null,
color: l.color
});

letters.splice(i, 1);
}
}
}

function windowResized() {
const heroContainer = document.getElementById("p5-hero");
resizeCanvas(heroContainer.offsetWidth, heroContainer.offsetHeight);
layoutText();
}

function isPointerInsideCanvas() {
return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}


// INLINE MARGINAL NOTES ALIGNMENT
function scrollToCenter(el) {
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const targetY = absoluteTop - window.innerHeight / 2 + rect.height / 2;
    
    window.scrollTo({
    top: Math.max(0, targetY),
    behavior: "smooth"
    });
    }
    
    function alignNotes() {
    const notes = Array.from(document.querySelectorAll('.note'));
    const column = document.querySelector('.notes-column');
    
    if (!column) return;
    
    const columnRect = column.getBoundingClientRect();
    const scrollY = window.scrollY;
    const placed = [];
    
    notes.forEach(note => {
    const link = note.querySelector('a');
    if (!link) return;
    
    const ref = document.querySelector(link.getAttribute('href'));
    if (!ref) return;
    
    const refRect = ref.getBoundingClientRect();
    
    let y = scrollY + refRect.top - (scrollY + columnRect.top);
    const height = note.offsetHeight || 80;
    
    placed.forEach(prev => {
    const overlap = !(y + height < prev.top || y > prev.bottom);
    if (overlap) y = prev.bottom + 12;
    });
    
    note.style.top = `${y}px`;
    
    placed.push({
    top: y,
    bottom: y + height
    });
    });
    }
    
    function clearActiveNotes() {
    document.querySelectorAll('.note').forEach(note => {
    note.classList.remove('is-active');
    });
    }
    
    function setupInteractions() {
    const keywords = document.querySelectorAll('.note-ref');
    const noteLinks = document.querySelectorAll('.note a');
    
    keywords.forEach(keyword => {
    keyword.addEventListener('click', e => {
    e.preventDefault();
    
    const targetNote = document.querySelector(keyword.getAttribute('href'));
    clearActiveNotes();
    
    if (targetNote) {
    targetNote.classList.add('is-active');
    scrollToCenter(targetNote);
    }
    });
    });
    
    noteLinks.forEach(link => {
    link.addEventListener('click', e => {
    e.preventDefault();
    
    const parentNote = link.closest('.note');
    const ref = document.querySelector(link.getAttribute('href'));
    
    clearActiveNotes();
    
    if (parentNote) {
    parentNote.classList.add('is-active');
    }
    
    if (ref) {
    scrollToCenter(ref);
    }
    });
    });
    
    document.addEventListener('click', e => {
    const clickedKeyword = e.target.closest('.note-ref');
    const clickedNoteLink = e.target.closest('.note a');
    
    if (!clickedKeyword && !clickedNoteLink) {
    clearActiveNotes();
    }
    });
    }
    
    window.addEventListener('load', () => {
    alignNotes();
    setupInteractions();
    });
    
    window.addEventListener('resize', alignNotes);
    window.addEventListener('scroll', alignNotes);

    //Align images

    function alignImages() {
        const imageColumn = document.querySelector('.image-column');
        const images = Array.from(document.querySelectorAll('.image-frame'));
      
        if (!imageColumn || window.innerWidth <= 980) return;
      
        const columnRect = imageColumn.getBoundingClientRect();
        const scrollY = window.scrollY;
        const placed = [];
      
        images.forEach(image => {
          const chapterId = image.dataset.chapter;
          const slot = parseFloat(image.dataset.slot || "0.5");
          const chapter = document.getElementById(chapterId);
      
          if (!chapter) return;
      
          const chapterRect = chapter.getBoundingClientRect();
          const chapterTop = scrollY + chapterRect.top - (scrollY + columnRect.top);
          const chapterHeight = chapterRect.height;
      
          let y = chapterTop + (chapterHeight * slot) - (image.offsetHeight * 0.5);
          let height = image.offsetHeight || 120;
      
          placed.forEach(prev => {
            const overlap = !(y + height < prev.top || y > prev.bottom);
            if (overlap) {
              y = prev.bottom + 18;
            }
          });
      
          image.style.top = `${Math.max(0, y)}px`;
      
          placed.push({
            top: Math.max(0, y),
            bottom: Math.max(0, y) + height
          });
        });
      }
      
      window.addEventListener('load', () => {
        alignImages();
      });
      
      window.addEventListener('resize', alignImages);
      window.addEventListener('scroll', alignImages);
      
      window.addEventListener('load', () => {
        document.querySelectorAll('.image-frame img').forEach(img => {
          if (!img.complete) {
            img.addEventListener('load', alignImages);
          }
        });
      });

/* ================= CUSTOM CURSOR ================= */

const customCursor = document.querySelector('.heartbeat-cursor');

if (customCursor) {
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let targetX = cursorX;
  let targetY = cursorY;

  function animateCursor() {
    cursorX += (targetX - cursorX) * 0.16;
    cursorY += (targetY - cursorY) * 0.16;

    customCursor.style.left = `${cursorX}px`;
    customCursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
  }

  function hideNativeCursor() {
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';
  }

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    customCursor.style.opacity = '1';
    hideNativeCursor();
  });

  window.addEventListener('mousedown', hideNativeCursor);
  window.addEventListener('mouseup', hideNativeCursor);
  window.addEventListener('mouseover', hideNativeCursor);
  window.addEventListener('mouseenter', hideNativeCursor);
  window.addEventListener('focus', hideNativeCursor);

  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) {
      customCursor.style.opacity = '0';
    }
  });

  const interactiveElements = document.querySelectorAll(
    'a, button, input, textarea, select, label, summary, .note-ref, .note a, .hero-nav-item, .hero-nav-button, canvas'
  );

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      customCursor.classList.add('is-cursor-hover');
      hideNativeCursor();
    });

    el.addEventListener('mouseleave', () => {
      customCursor.classList.remove('is-cursor-hover');
      hideNativeCursor();
    });
  });

  hideNativeCursor();
  animateCursor();
}