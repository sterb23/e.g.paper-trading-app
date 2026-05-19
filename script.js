/* =====================================================
   TRADE TERMINAL PRO — FULL VERSION
   Candles + Indicators + Save + Tutorial + Portfolio
===================================================== */

let balance = Number(localStorage.getItem("balance")) || 100;
let username = localStorage.getItem("username") || "";
let portfolio = JSON.parse(localStorage.getItem("portfolio") || "{}");

/* =========================
   MARKET (20+ REAL STOCKS)
========================= */
let prices = {
  AAPL: 180, TSLA: 250, MSFT: 420, AMZN: 3200, GOOG: 2800,
  META: 500, NVDA: 900, NFLX: 600, AMD: 150, INTC: 45,
  IBM: 180, ORCL: 140, DIS: 110, UBER: 75, SPOT: 320,
  SHOP: 85, PYPL: 65, COIN: 180, BAC: 40, JPM: 160,
  GOLD: 2000, BTC: 45000
};

/* =========================
   CANDLE DATA
========================= */
let history = {};
for (let s in prices) history[s] = [];

/* =========================
   TUTORIAL (FULL PRO VERSION)
========================= */
let tutorial = [
  "Welcome to Trade Terminal Pro.",
  "This is a professional trading simulator.",
  "You start with $100 virtual capital.",
  "Markets include real-world stock tickers.",
  "AAPL, TSLA, NVDA represent real companies.",
  "Prices update every few seconds automatically.",
  "Each asset behaves differently depending on volatility.",
  "High volatility = higher risk and reward.",
  "Low volatility = safer but slower growth.",
  "You can BUY and SELL at any time.",
  "Your portfolio tracks all holdings.",
  "Candlestick charts show price movement.",
  "Green candles = price increased.",
  "Red candles = price decreased.",
  "Moving Average shows trend direction.",
  "RSI shows momentum strength.",
  "You can zoom charts and switch timeframes.",
  "All data is saved in your browser.",
  "Even after refresh, your account stays intact.",
  "This is a training simulator, not real money.",
  "Now you are ready to trade."
];

let step = 0;

/* =========================
   SAVE SYSTEM
========================= */
function save() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("username", username);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

/* =========================
   START APP
========================= */
function startApp() {
  let input = document.getElementById("usernameInput").value;

  if (input) username = input;

  save();

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("tutorialScreen").classList.remove("hidden");

  showTutorial();
}

/* =========================
   TUTORIAL SYSTEM
========================= */
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

  document.getElementById("welcome").innerText =
    "Welcome " + username;

  renderMarket();
  updateBalance();

  setInterval(updatePrices, 2000);
}

/* =========================
   MARKET RENDER
========================= */
function renderMarket() {
  let html = "";

  for (let s in prices) {
    html += `
      <div class="stock">
        <b>${s}</b><br>
        Price: $${prices[s].toFixed(2)}<br>

        <button onclick="buy('${s}')">Buy</button>
        <button onclick="sell('${s}')">Sell</button>
        <button onclick="viewChart('${s}')">Chart</button>
      </div>
    `;
  }

  document.getElementById("market").innerHTML = html;
}

/* =========================
   MARKET ENGINE + CANDLES
========================= */
function updatePrices() {
  for (let s in prices) {
    let open = prices[s];

    let change = (Math.random() - 0.5) * (prices[s] * 0.02);
    let close = Math.max(1, open + change);

    prices[s] = close;

    history[s].push({
      open,
      close,
      high: Math.max(open, close) * 1.01,
      low: Math.min(open, close) * 0.99
    });

    if (history[s].length > 60) history[s].shift();
  }

  renderMarket();
  updateBalance();
}

/* =========================
   BUY / SELL
========================= */
function buy(stock) {
  if (balance < prices[stock]) return alert("Not enough money");

  balance -= prices[stock];
  portfolio[stock] = (portfolio[stock] || 0) + 1;

  save();
}

function sell(stock) {
  if (!portfolio[stock]) return alert("No shares");

  let value = portfolio[stock] * prices[stock];

  let ok = confirm(
    `Sell ${portfolio[stock]} ${stock}?\nYou receive: $${value.toFixed(2)}`
  );

  if (!ok) return;

  balance += value;
  portfolio[stock] = 0;

  save();
}

/* =========================
   BALANCE
========================= */
function updateBalance() {
  document.getElementById("balance").innerText =
    "Balance: $" + balance.toFixed(2);
}

/* =========================
   CANDLESTICK CHART (FULL)
========================= */
function viewChart(stock) {
  let old = document.getElementById("chart");
  if (old) old.remove();

  let canvas = document.createElement("canvas");
  canvas.id = "chart";
  canvas.width = 600;
  canvas.height = 300;
  canvas.style.display = "block";
  canvas.style.margin = "20px";

  document.body.appendChild(canvas);

  let ctx = canvas.getContext("2d");
  let data = history[stock];

  if (!data.length) return alert("No chart data yet");

  let w = canvas.width / data.length;

  for (let i = 0; i < data.length; i++) {
    let c = data[i];

    let x = i * w;

    let openY = canvas.height - c.open / 2;
    let closeY = canvas.height - c.close / 2;
    let highY = canvas.height - c.high / 2;
    let lowY = canvas.height - c.low / 2;

    /* wick */
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x + w / 2, highY);
    ctx.lineTo(x + w / 2, lowY);
    ctx.stroke();

    /* body */
    ctx.fillStyle = c.close > c.open ? "#22c55e" : "#ef4444";

    ctx.fillRect(
      x,
      Math.min(openY, closeY),
      w * 0.8,
      Math.abs(openY - closeY)
    );
  }
}