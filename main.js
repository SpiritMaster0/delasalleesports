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
homeBtn.addEventListener("click", e => {
  e.preventDefault();
  document.body.classList.remove("show-overview","show-matches","show-team","show-leaderboard","transitioning");
  window.scrollTo(0,0);
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
const SCHOOL_ID = "c537f1f5-ebe0-4b7e-bf20-0826620ee6d0";
const CSV_URL = "https://docs.google.com/spreadsheets/d/1HF0A4ja7ELz-Iksq1iRqUqYwRwhO0nZevUxBHvWRmjw/export?exportFormat=csv&gid=1106193519";
const YOUR_NAME = "DE LA SALLE HIGH SCHOOL";
const CURRENT_WEEK = 6; // this could also be read from the sheet

fetch(CSV_URL)
  .then(res => res.text())
  .then(csvText => {
    const data = Papa.parse(csvText, { header: true }).data;

    // Filter for your school only
    const schoolMatches = data.filter(row =>
      row["Team 1 ID"] === SCHOOL_ID || row["Team 2 ID"] === SCHOOL_ID
    );

    // Convert Week to number for sorting
    schoolMatches.forEach(row => {
      row.weekNum = parseInt(row.Week.replace(/\D/g,"")) || 0;
    });

    // Sort ascending by week
    schoolMatches.sort((a,b) => a.weekNum - b.weekNum);

    // Featured match = current week
    const featuredMatch = schoolMatches.find(row => row.weekNum === CURRENT_WEEK);
    if(featuredMatch){
      const opponent = (featuredMatch["Team Name"] === YOUR_NAME) ? featuredMatch["Team Name.1"] : featuredMatch["Team Name"];
      featured.innerHTML = `
        <h3>${YOUR_NAME} vs ${opponent}</h3>
        <p><strong>Week:</strong> ${featuredMatch.Week}</p>
        <p><strong>Time:</strong> Thursday · 4:15 PM</p>
      `;
    }

    // Upcoming matches = CurrentWeek + 1 or more
    const upcomingMatches = schoolMatches.filter(row => row.weekNum > CURRENT_WEEK);
    // Past matches = Week < CurrentWeek
    const pastMatches = schoolMatches.filter(row => row.weekNum < CURRENT_WEEK);

    // Combine past + upcoming (optional: style past differently)
    const sideMatches = [...pastMatches, ...upcomingMatches];

    sideWrap.innerHTML = "";
    sideMatches.forEach((row,i) => {
      const opponent = (row["Team Name"] === YOUR_NAME) ? row["Team Name.1"] : row["Team Name"];
      const card = document.createElement("div");
      card.className = "card";
      card.style.transitionDelay = `${i*0.05}s`;
      card.innerHTML = `
        <h3>${YOUR_NAME} vs ${opponent}</h3>
        <p><strong>Week:</strong> ${row.Week}</p>
        <p><strong>Time:</strong> Thursday · 4:15 PM</p>
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

  let imgSrc = "";
  if (row.image) {
    if (row.image.includes("drive.google.com")) {
      const match = row.image.match(/[-\w]{25,}/);
      if (match) imgSrc = `https://drive.google.com/uc?id=${match[0]}`;
    } else {
      imgSrc = row.image;
    }
  }

  card.innerHTML = `
    ${imgSrc ? `<img src="${imgSrc}">` : ""}
    <h3>${row.name}</h3>
    <p>${row.role || ""}</p>
    <div class="extra-info">
      ${row.description || "No extra info"}
    </div>
  `;

  teamWrap.appendChild(card);

  // ✅ CLICK EXPAND
  card.addEventListener("click", () => {
    document.querySelectorAll(".team-card").forEach(c => {
      if (c !== card) c.classList.remove("expanded");
    });

    card.classList.toggle("expanded");
  });
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

//const teamCards = document.getElementById("teamCards");
const fanCards = document.getElementById("fanCards");
const FAN_URL = `https://opensheet.elk.sh/${SHEET_ID}/Fans`;

fetch(FAN_URL)
  .then(res => res.json())
  .then(data => {
    fanCards.innerHTML = "";

    data.forEach(row => {
    const card = document.createElement("div");
    card.className = "card";

    let imgSrc = "";
    if (row.image) {
      // If it's a Google Drive link
      if (row.image.includes("drive.google.com")) {
        // Convert to direct access link
        const match = row.image.match(/[-\w]{25,}/);
        if (match) imgSrc = `https://drive.google.com/uc?id=${match[0]}`;
      } else {
        imgSrc = row.image; // regular URL
      }
    }

    card.innerHTML = `
      ${imgSrc ? `<img src="${imgSrc}" />` : ""}
      <h3>${row.name}</h3>
      <p>${row.message || ""}</p>
    `;
    fanCards.appendChild(card);
  });


    const visibleCards = 3;
    const totalCards = data.length;

    // Clone first visibleCards to the end for seamless looping
    for (let i = 0; i < visibleCards; i++) {
      const clone = fanCards.children[i].cloneNode(true);
      fanCards.appendChild(clone);
    }

    let index = 0;
    const step = 100 / visibleCards;

    setInterval(() => {
      index++;
      fanCards.style.transition = "transform 0.5s ease-in-out";
      fanCards.style.transform = `translateX(-${step * index}%)`;

      // When we reach cloned cards, jump back instantly
      if (index >= totalCards) {
        setTimeout(() => {
          fanCards.style.transition = "none";
          fanCards.style.transform = `translateX(0)`;
          index = 0;
        }, 500); // match the transition duration
      }
    }, 6000); // every 6s
  });

// ---------- Leaderboard Button ----------
const leaderboardNav = document.getElementById("leaderboardNav");
const leaderboardBack = document.getElementById("leaderboardBack");

leaderboardNav.addEventListener("click", e => {
  e.preventDefault();

  document.body.classList.remove("show-overview","show-matches","show-team","transitioning");
  void document.body.offsetWidth;
  document.body.classList.add("show-leaderboard");

  // load leaderboard from Google Sheets
  loadLeaderboard();
});

leaderboardBack.addEventListener("click", () => {
  document.body.classList.remove("show-leaderboard");
});

// ---------- Fetch Leaderboard from Google Sheet ----------
const leaderboardWrap = document.querySelector(".leaderboard");
const leaderboardWrapSHEET_ID = "1HF0A4ja7ELz-Iksq1iRqUqYwRwhO0nZevUxBHvWRmjw";
const LEADERBOARD_SHEET = "leaderboard"; // replace with your tab name
const LEADERBOARD_URL = `https://opensheet.elk.sh/${leaderboardWrapSHEET_ID}/${LEADERBOARD_SHEET}`;

function loadLeaderboard() {
  fetch(LEADERBOARD_URL)
    .then(res => res.json())
    .then(data => {
      leaderboardWrap.innerHTML = "";

      // Sort descending by Score
      data.sort((a,b) => Number(b.Score) - Number(a.Score));

      data.forEach((row, i) => {
        const rank = i + 1;

        const rowDiv = document.createElement("div");
        rowDiv.className = `lb-row ${rank <= 3 ? `rank-${rank}` : ""}`;

        rowDiv.innerHTML = `
          <div class="lb-rank">${rank}</div>
          <div class="lb-name">${row.Player || "Unnamed"}</div>
          <div class="lb-score">${row.Score || 0}</div>
        `;

        leaderboardWrap.appendChild(rowDiv);
      });
    })
    .catch(err => console.error("Failed to load leaderboard:", err));
}

loadLeaderboard();
setInterval(loadLeaderboard, 60000);

window.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("open") === "leaderboard") {
        const leaderboardButton = document.getElementById("leaderboardNav");
        if (leaderboardButton) {
            leaderboardButton.click();
        }
    }
});
