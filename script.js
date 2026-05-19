let balance = Number(localStorage.getItem("balance"));
if (!balance) balance = 100;

let username = localStorage.getItem("username") || "";
let portfolio = JSON.parse(localStorage.getItem("portfolio") || "{}");

/* ================= MARKET ================= */
let prices = {
  AAPL: 180, TSLA: 250, MSFT: 420, AMZN: 3200, GOOG: 2800,
  META: 500, NVDA: 900, NFLX: 600, AMD: 150, INTC: 45,
  IBM: 180, ORCL: 140, DIS: 110, UBER: 75, SPOT: 320,
  SHOP: 85, PYPL: 65, COIN: 180, BAC: 40, JPM: 160,
  GOLD: 2000, BTC: 45000
};

let history = {};
for (let s in prices) history[s] = [];

/* ================= SAVE ================= */
function save() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("username", username);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

/* ================= INIT UI (IMPORTANT FIX) ================= */
window.onload = function () {
  if (document.getElementById("balance")) {
    document.getElementById("balance").innerText = "Balance: $" + balance.toFixed(2);
  }
  renderMarket();
  updatePortfolio();
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
  "Welcome to Trading Simulator",
  "You start with $100",
  "Stocks move every few seconds",
  "Buy low, sell high",
  "Your portfolio updates live",
  "Charts show candlesticks",
  "Now start trading"
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
  updateBalance();
  updatePortfolio();

  setInterval(updatePrices, 2000);
}

/* ================= MARKET RENDER ================= */
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

/* ================= PRICE MOVEMENT (FIXED) ================= */
function updatePrices() {
  for (let s in prices) {
    let open = prices[s];

    let change = (Math.random() - 0.5) * (prices[s] * 0.03);
    let close = Math.max(1, open + change);

    prices[s] = close;

    history[s].push({
      open,
      close,
      high: Math.max(open, close),
      low: Math.min(open, close)
    });

    if (history[s].length > 80) history[s].shift();
  }

  renderMarket();
  updateBalance();
  updatePortfolio();
}

/* ================= BUY ================= */
function buy(stock) {
  if (balance < prices[stock]) return alert("Not enough money");

  balance -= prices[stock];
  portfolio[stock] = (portfolio[stock] || 0) + 1;

  save();

  updateBalance();
  updatePortfolio();
}

/* ================= SELL ================= */
function sell(stock) {
  if (!portfolio[stock]) return alert("Nothing to sell");

  let value = portfolio[stock] * prices[stock];

  let ok = confirm(`Sell ${portfolio[stock]} ${stock} for $${value.toFixed(2)}?`);
  if (!ok) return;

  balance += value;
  portfolio[stock] = 0;

  save();

  updateBalance();
  updatePortfolio();
}

/* ================= BALANCE FIX ================= */
function updateBalance() {
  document.getElementById("balance").innerText =
    "Balance: $" + balance.toFixed(2);
}

/* ================= PORTFOLIO FIX ================= */
function updatePortfolio() {
  let html = "";
  let total = 0;

  for (let s in portfolio) {
    let value = portfolio[s] * prices[s];
    total += value;

    html += `${s}: ${portfolio[s]} ($${value.toFixed(2)})<br>`;
  }

  document.getElementById("portfolio").innerHTML =
    html || "No holdings";

  document.getElementById("balance").innerText =
    "Balance: $" + balance.toFixed(2) + " | Portfolio: $" + total.toFixed(2);
}

/* ================= SIMPLE CHART FIX ================= */
function openChart(stock) {
  let data = history[stock];

  if (!data.length) return alert("No data yet");

  let canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 250;

  document.body.appendChild(canvas);

  let ctx = canvas.getContext("2d");

  let max = Math.max(...data.map(d => d.high));
  let min = Math.min(...data.map(d => d.low));
  let range = max - min;

  let w = canvas.width / data.length;

  for (let i = 0; i < data.length; i++) {
    let c = data[i];

    let x = i * w;

    let scale = v => canvas.height - ((v - min) / range) * canvas.height;

    let o = scale(c.open);
    let cl = scale(c.close);
    let h = scale(c.high);
    let l = scale(c.low);

    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x + w / 2, h);
    ctx.lineTo(x + w / 2, l);
    ctx.stroke();

    ctx.fillStyle = c.close > c.open ? "green" : "red";
    ctx.fillRect(x, Math.min(o, cl), w * 0.8, Math.abs(o - cl));
  }
}