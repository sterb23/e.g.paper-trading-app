/* ================= STATE ================= */
let session = JSON.parse(localStorage.getItem("session")) || {
  loggedIn: false,
  username: "",
  tutorialDone: false
};

let balance = Number(localStorage.getItem("balance")) || 100;
let portfolio = JSON.parse(localStorage.getItem("portfolio") || "{}");

/* ================= MARKET ================= */
let prices = {
  AAPL: 180, TSLA: 250, MSFT: 420,
  AMZN: 3200, GOOG: 2800, META: 500,
  NVDA: 900, NFLX: 600, AMD: 150,
  BTC: 42000
};

let history = {};
for (let s in prices) history[s] = [];

/* ================= SAVE ================= */
function save() {
  localStorage.setItem("session", JSON.stringify(session));
  localStorage.setItem("balance", balance);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

/* ================= INIT ================= */
window.onload = () => {
  if (session.loggedIn) enterApp();
  else document.getElementById("loginScreen").classList.remove("hidden");

  setInterval(updatePrices, 1200);
};

/* ================= LOGIN ================= */
function startApp() {
  let name = document.getElementById("usernameInput").value;
  if (!name) return;

  session.username = name;
  session.loggedIn = true;

  save();

  document.getElementById("loginScreen").classList.add("hidden");

  if (!session.tutorialDone) startTutorial();
  else enterApp();
}

/* ================= TUTORIAL ================= */
let tutorial = [
  "Welcome to Broker Terminal V6",
  "Charts now behave like real trading tools",
  "You can zoom + drag charts",
  "Crosshair shows price levels",
  "Let’s trade"
];

let step = 0;

function startTutorial() {
  document.getElementById("tutorialScreen").classList.remove("hidden");
  showTutorial();
}

function showTutorial() {
  document.getElementById("tutorialText").innerText = tutorial[step];
}

function nextTutorial() {
  step++;
  if (step >= tutorial.length) {
    session.tutorialDone = true;
    save();
    document.getElementById("tutorialScreen").classList.add("hidden");
    enterApp();
    return;
  }
  showTutorial();
}

/* ================= APP ================= */
function enterApp() {
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("welcome").innerText = session.username;

  renderMarket();
  updateUI();
}

/* ================= LOGOUT ================= */
function logout() {
  session.loggedIn = false;
  session.username = "";
  save();
  location.reload();
}

/* ================= MARKET ================= */
function renderMarket() {
  let html = "";

  for (let s in prices) {
    html += `
      <div class="stock">
        <b>${s}</b><br>
        $${prices[s].toFixed(2)}<br>

        <button onclick="buy('${s}')">Buy</button>
        <button onclick="sell('${s}')">Sell</button>
        <button onclick="openChart('${s}')">Chart</button>
      </div>
    `;
  }

  document.getElementById("market").innerHTML = html;
}

/* ================= PRICE ENGINE ================= */
function updatePrices() {
  for (let s in prices) {
    let open = prices[s];
    let change = (Math.random() - 0.5) * open * 0.012;
    let close = Math.max(1, open + change);

    prices[s] = close;

    history[s].push({
      open,
      close,
      high: Math.max(open, close),
      low: Math.min(open, close)
    });

    if (history[s].length > 300) history[s].shift();
  }

  renderMarket();
  updateUI();
}

/* ================= TRADE ================= */
function buy(s) {
  if (balance < prices[s]) return;
  balance -= prices[s];
  portfolio[s] = (portfolio[s] || 0) + 1;
  save();
  updateUI();
}

function sell(s) {
  if (!portfolio[s]) return;
  balance += prices[s] * portfolio[s];
  portfolio[s] = 0;
  save();
  updateUI();
}

/* ================= UI ================= */
function updateUI() {
  document.getElementById("balance").innerText =
    "Balance: $" + balance.toFixed(2);

  let html = "";
  for (let s in portfolio) {
    html += `${s}: ${portfolio[s]}<br>`;
  }

  document.getElementById("portfolio").innerHTML =
    html || "No holdings";
}

/* ================= CHART SYSTEM ================= */
let currentStock = null;
let zoom = 1;
let offsetX = 0;
let dragging = false;
let lastX = 0;

function openChart(stock) {
  currentStock = stock;
  document.getElementById("chartModal").classList.remove("hidden");
  document.getElementById("chartTitle").innerText = stock;

  setupChart();
  drawChart();
}

function closeChart() {
  document.getElementById("chartModal").classList.add("hidden");
}

/* ================= INTERACTIONS ================= */
function setupChart() {
  let canvas = document.getElementById("chartCanvas");

  canvas.onmousedown = e => {
    dragging = true;
    lastX = e.clientX;
  };

  canvas.onmouseup = () => dragging = false;
  canvas.onmouseleave = () => dragging = false;

  canvas.onmousemove = e => {
    if (dragging) {
      offsetX += e.clientX - lastX;
      lastX = e.clientX;
      drawChart();
    } else {
      drawChart(e);
    }
  };

  canvas.onwheel = e => {
    e.preventDefault();
    zoom += e.deltaY < 0 ? 0.1 : -0.1;
    zoom = Math.max(0.4, Math.min(6, zoom));
    drawChart();
  };
}

/* ================= V6 CHART ENGINE ================= */
function drawChart(mouseEvent) {
  let canvas = document.getElementById("chartCanvas");
  let ctx = canvas.getContext("2d");

  let data = history[currentStock];
  if (!data || data.length < 20) return;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let max = Math.max(...data.map(d => d.high));
  let min = Math.min(...data.map(d => d.low));
  let range = max - min || 1;

  let candleW = (canvas.width / data.length) * zoom;

  let mouseX = 0;
  let mouseY = 0;

  if (mouseEvent) {
    let rect = canvas.getBoundingClientRect();
    mouseX = mouseEvent.clientX - rect.left;
    mouseY = mouseEvent.clientY - rect.top;
  }

  for (let i = 0; i < data.length; i++) {
    let d = data[i];

    let x = i * candleW + offsetX;

    if (x < -100 || x > canvas.width + 100) continue;

    let o = canvas.height - ((d.open - min) / range) * canvas.height;
    let c = canvas.height - ((d.close - min) / range) * canvas.height;
    let h = canvas.height - ((d.high - min) / range) * canvas.height;
    let l = canvas.height - ((d.low - min) / range) * canvas.height;

    ctx.strokeStyle = "#9ca3af";
    ctx.beginPath();
    ctx.moveTo(x + candleW / 2, h);
    ctx.lineTo(x + candleW / 2, l);
    ctx.stroke();

    ctx.fillStyle = d.close > d.open ? "#22c55e" : "#ef4444";

    ctx.fillRect(
      x,
      Math.min(o, c),
      candleW * 0.7,
      Math.abs(o - c)
    );
  }

  /* CROSSHAIR */
  if (mouseEvent) {
    ctx.strokeStyle = "rgba(59,130,246,0.6)";
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, mouseY);
    ctx.lineTo(canvas.width, mouseY);
    ctx.stroke();

    ctx.setLineDash([]);

    let price = max - (mouseY / canvas.height) * range;

    ctx.fillStyle = "#3b82f6";
    ctx.fillText(price.toFixed(2), mouseX + 8, mouseY - 8);
  }
}