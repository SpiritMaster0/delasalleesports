/* Canvas tiled diagonal scroller — spaced tiles */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

const TILE = 160;         // image size box (keeps image rendering size)
const GAP  = 40;          // how much empty space between tiles (change this)
const CELL = TILE + GAP;  // actual grid cell size used for tiling

const imagesSrc = [
  "Images/school-logo.png",
  "Images/smashbroslogo.png",
  "Images/valorant-logo.png"
];

let dpr = Math.max(1, window.devicePixelRatio || 1);
function resizeCanvas() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* load images */
function loadAll(srcs){
  return Promise.all(srcs.map(s => new Promise((res, rej) => {
    const img = new Image();
    img.src = s;
    img.onload = () => res(img);
    img.onerror = rej;
  })));
}

loadAll(imagesSrc).then(images => {
  // scale images to TILE * dpr (preserve aspect) into offscreen canvases
  images = images.map(img => {
    const c = document.createElement('canvas');
    const ar = img.width / img.height;
    let w = TILE * dpr, h = TILE * dpr;
    if (ar > 1) h = Math.round(w / ar); else w = Math.round(h * ar);
    c.width = w; c.height = h;
    const cx = c.getContext('2d');
    cx.drawImage(img, 0, 0, w, h);
    return c;
  });

  let offsetX = 0;
  let offsetY = 0;
  const speed = 0.35 * dpr; 

  function draw() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0,0,W,H);

    ctx.save();
    const angle = -20 * Math.PI / 180;
    ctx.translate(W/2, H/2);
    ctx.rotate(angle);
    ctx.translate(-W/2, -H/2);

    // continuous offsets in CELL units
    offsetX = (offsetX - speed) % (CELL * dpr);
    offsetY = (offsetY + speed) % (CELL * dpr);

    if (offsetX > 0) offsetX -= CELL * dpr;
    if (offsetY > 0) offsetY -= CELL * dpr;

    const startX = -CELL * dpr + offsetX;
    const startY = -CELL * dpr + offsetY;
    const cols = Math.ceil(W / (CELL * dpr)) + 3;
    const rows = Math.ceil(H / (CELL * dpr)) + 3;

    ctx.globalAlpha = 0.5;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = Math.round(startX + c * CELL * dpr);
        const dy = Math.round(startY + r * CELL * dpr);

        const imgIndex = (c + r) % images.length;
        const img = images[imgIndex];
        const iw = img.width, ih = img.height;

        // center the image inside the CELL box
        const px = dx + Math.round((CELL * dpr - iw) / 2);
        const py = dy + Math.round((CELL * dpr - ih) / 2);

        ctx.drawImage(img, px, py, iw, ih);
      }
    }

    ctx.restore();
    requestAnimationFrame(draw);
  }

  draw();
}).catch(err => {
  console.error('Failed to load images', err);
});

const btn = document.getElementById("enterBtn");
const SHEET_ID = "1HF0A4ja7ELz-Iksq1iRqUqYwRwhO0nZevUxBHvWRmjw";
const SHEET_NAME = "Sheet1"
const cardsWrap = document.getElementById("overviewCards");

// Trigger animation
btn.addEventListener("click", () => {
  document.body.classList.add("transitioning");
  setTimeout(() => {
    document.body.classList.add("show-overview");
  }, 200);
});

// Fetch data from Google Sheet
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

fetch(URL)
  .then(res => res.json())
  .then(data => {
    cardsWrap.innerHTML = "";

    data.forEach((row, i) => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.transitionDelay = `${i*0.1}s`;

        card.innerHTML = `
            <h3>${row.title}</h3>
            <p>${row.description}</p>
            ${row.image ? `<img src="${row.image}" alt="${row.title}" />` : ""}
        `;
        cardsWrap.appendChild(card);
        });
  })
  .catch(err => console.error("Failed to load Sheet:", err));

  const homeBtn = document.getElementById("homeBtn");
homeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  document.body.classList.remove("show-overview", "show-matches", "show-team", "transitioning");
    window.scrollTo(0, 0);
});

const matchesBtn = document.getElementById("matchesBtn");
const matchesBtn2 = document.getElementById("matchesBtn2")
const matchesCardsWrap = document.getElementById("matchesCards");
const MATCH_SHEET_ID = "1HF0A4ja7ELz-Iksq1iRqUqYwRwhO0nZevUxBHvWRmjw"; // same spreadsheet
const MATCH_SHEET_NAME = "Matches";

matchesBtn.addEventListener("click", () => {
  document.body.classList.add("transitioning");
  setTimeout(() => {
    document.body.classList.remove("show-overview"); // hide about panel if open
    document.body.classList.add("show-matches");     // show matches panel
  }, 200);
});

matchesBtn2.addEventListener("click", () => {
  document.body.classList.add("transitioning");
  setTimeout(() => {
    document.body.classList.remove("show-overview"); // hide about panel if open
    document.body.classList.add("show-matches");     // show matches panel
  }, 200);
});

// Fetch matches from Sheet
const featured = document.getElementById("featuredMatch");
const sideWrap = document.getElementById("sideMatches");
const MATCH_URL = `https://opensheet.elk.sh/${SHEET_ID}/Matches`;

fetch(MATCH_URL)
  .then(res => res.json())
  .then(data => {
    // Sort by date descending (most recent first)
    data.sort((a,b) => new Date(b.date) - new Date(a.date));

    // Featured match
    const top = data[0];
    featured.innerHTML = `
      <h3>${top.title}</h3>
      <p><strong>Date:</strong> ${top.date}</p>
      <p><strong>Time:</strong> ${top.time}</p>
      <p>${top.description || ""}</p>
      ${top.image ? `<img src="${top.image}" style="width:100%; border-radius:12px; margin-top:10px;" />` : ""}
    `;

    // Side matches (rest)
    sideWrap.innerHTML = "";
    data.slice(1).forEach((row,i) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.transitionDelay = `${i*0.05}s`; // optional stagger
      card.innerHTML = `
        <h3>${row.title}</h3>
        <p><strong>Date:</strong> ${row.date}</p>
        <p><strong>Time:</strong> ${row.time}</p>
      `;
      sideWrap.appendChild(card);
    });
  })
  .catch(err => console.error("Failed to load matches:", err));

  const teamWrap = document.getElementById("teamCards");

function loadTeam() {
  const TEAM_URL = `https://opensheet.elk.sh/${SHEET_ID}/team`;

  fetch(TEAM_URL)
    .then(res => res.json())
    .then(data => {
      teamWrap.innerHTML = "";

      data.forEach((row, i) => {
        const card = document.createElement("div");
        card.className = "card team-card";
        card.style.transitionDelay = `${i * 0.08}s`;

        card.innerHTML = `
          ${row.image ? `<img src="${row.image}" />` : ""}
          <h3>${row.name}</h3>
          <p><strong>${row.game}</strong></p>
          <p>${row.role || ""}</p>
        `;

        teamWrap.appendChild(card);
      });
    })
    .catch(err => console.error("Team load failed:", err));
}
loadTeam();

const teamNav = document.getElementById("teamNav");

teamNav.addEventListener("click", e => {
  e.preventDefault();

  document.body.classList.remove("show-overview", "show-matches", "transitioning");
  document.body.classList.remove("show-team");
  void document.body.offsetWidth;

  document.body.classList.add("show-team");

  window.scrollTo(0, 0);
});


