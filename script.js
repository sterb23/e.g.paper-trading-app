let balance = Number(localStorage.getItem("balance"));
if (!balance) balance = 100;

let username = localStorage.getItem("username") || "";
let portfolio = JSON.parse(localStorage.getItem("portfolio") || "{}");
let trades = JSON.parse(localStorage.getItem("trades") || "[]");

/* ================= MARKET ================= */
let prices = {
  AAPL: 180, TSLA: 250, MSFT: 420, AMZN: 3200, GOOG: 2800,
  META: 500, NVDA: 900, NFLX: 600, AMD: 150, INTC: 45,
  IBM: 180, ORCL: 140, DIS: 110, UBER: 75, SPOT: 320,
  SHOP: 85, PYPL: 65, COIN: 180, BAC: 40, JPM: 160,
  GOLD: 2000, BTC: 45000
};

/* ================= CANDLE HISTORY ================= */
let history = {};
for (let s in prices) history[s] = [];

/* ================= SAVE ================= */
function save() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("username", username);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
  localStorage.setItem("trades", JSON.stringify(trades));
}

/* ================= INIT ================= */
window.onload = () => {
  renderMarket();
  updateUI();
  setInterval(updatePrices, 2000);
};

/* ================= START ================= */
function startApp() {
  let input = document.getElementById("usernameInput").value;
  if (input) username = input;

  save();

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("tutorialScreen").classList.remove("hidden");

  showTutorial();
}

/* ================= TUTORIAL ================= */
let tutorial = [
  "Welcome to Trade Terminal PRO",
  "You start with $100 capital",
  "Markets simulate real volatility",
  "Buy low, sell high",
  "Portfolio shows real-time value",
  "Charts show candlestick structure",
  "Click any stock for analysis",
  "Everything is saved automatically",
  "Now begin trading"
];

let step = 0;

function showTutorial() {
  document.getElementById("tutorialText").innerText = tutorial[step];
}

function nextTutorial() {
  step++;
  if (step >= tutorial.length) return finishTutorial();
  showTutorial();
}

function finishTutorial() {
  document.getElementById("tutorialScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("welcome").innerText = "Welcome " + username;

  renderMarket();
  updateUI();
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

/* ================= PRICE ENGINE (REALISTIC) ================= */
function updatePrices() {
  for (let s in prices) {
    let old = prices[s];

    let volatility = old * 0.015;
    let change = (Math.random() - 0.5) * volatility;

    let close = Math.max(1, old + change);

    prices[s] = close;

    history[s].push({
      open: old,
      close,
      high: Math.max(old, close),
      low: Math.min(old, close)
    });

    if (history[s].length > 80) history[s].shift();
  }

  renderMarket();
  updateUI();
}

/* ================= BUY ================= */
function buy(stock) {
  if (balance < prices[stock]) return alert("Not enough balance");

  balance -= prices[stock];
  portfolio[stock] = (portfolio[stock] || 0) + 1;

  trades.push({
    type: "BUY",
    stock,
    price: prices[stock],
    time: Date.now()
  });

  save();
  updateUI();
}

/* ================= SELL ================= */
function sell(stock) {
  if (!portfolio[stock]) return alert("Nothing to sell");

  let value = portfolio[stock] * prices[stock];

  if (!confirm(`Sell ${portfolio[stock]} ${stock} for $${value.toFixed(2)}?`))
    return;

  balance += value;
  portfolio[stock] = 0;

  trades.push({
    type: "SELL",
    stock,
    price: prices[stock],
    time: Date.now()
  });

  save();
  updateUI();
}

/* ================= UI UPDATE (FIXED CORE) ================= */
function updateUI() {
  updateBalance();
  updatePortfolio();
}

/* ================= BALANCE ================= */
function updateBalance() {
  document.getElementById("balance").innerText =
    "Balance: $" + balance.toFixed(2);
}

/* ================= PORTFOLIO (PRO FIX) ================= */
function updatePortfolio() {
  let html = "";
  let total = balance;

  for (let s in portfolio) {
    let value = portfolio[s] * prices[s];
    total += value;

    html += `${s}: ${portfolio[s]} → $${value.toFixed(2)}<br>`;
  }

  document.getElementById("portfolio").innerHTML =
    html || "No holdings";

  document.getElementById("balance").innerText =
    `Balance: $${balance.toFixed(2)} | Total: $${total.toFixed(2)}`;
}

/* ================= PRO CHART MODAL ================= */
function openChart(stock) {
  let old = document.getElementById("chartModal");
  if (old) old.remove();

  let modal = document.createElement("div");
  modal.id = "chartModal";

  modal.innerHTML = `
    <div id="chartBox">
      <div id="chartHeader">
        <span>${stock} Analysis</span>
        <button onclick="closeChart()">✕</button>
      </div>
      <canvas id="chartCanvas" width="700" height="350"></canvas>
    </div>
  `;

  document.body.appendChild(modal);

  drawChart(stock);
}

function closeChart() {
  document.getElementById("chartModal").remove();
}

/* ================= REAL CANDLESTICK ENGINE ================= */
function drawChart(stock) {
  let canvas = document.getElementById("chartCanvas");
  let ctx = canvas.getContext("2d");

  let data = history[stock];
  if (!data.length) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let max = Math.max(...data.map(d => d.high));
  let min = Math.min(...data.map(d => d.low));
  let range = max - min || 1;

  let w = canvas.width / data.length;

  let scale = v =>
    canvas.height - ((v - min) / range) * canvas.height;

  for (let i = 0; i < data.length; i++) {
    let c = data[i];

    let x = i * w;

    let o = scale(c.open);
    let cl = scale(c.close);
    let h = scale(c.high);
    let l = scale(c.low);

    ctx.strokeStyle = "#aaa";
    ctx.beginPath();
    ctx.moveTo(x + w / 2, h);
    ctx.lineTo(x + w / 2, l);
    ctx.stroke();

    ctx.fillStyle = c.close > c.open ? "#22c55e" : "#ef4444";

    ctx.fillRect(
      x,
      Math.min(o, cl),
      w * 0.8,
      Math.abs(o - cl)
    );
  }
}