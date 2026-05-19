let balance = 100;
let portfolio = {};

let prices = {
  APPLE: 10,
  TESLA: 20,
  BTC: 50
};

/* CHART DATA (OHLC CANDLES) */
let candles = [];
let chartData = [];

/* INDICATORS */
let maLine = [];
let rsiLine = [];

/* TUTORIAL SKIPPED FOR SHORTNESS */
let tutorialStep = 0;

/* INIT */
function startApp() {
  let username = document.getElementById("usernameInput").value;
  if (!username) return alert("Enter username");

  localStorage.setItem("username", username);

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("welcome").innerText =
    "Welcome " + username;

  renderMarket();
  setInterval(updateMarket, 2000);
}

/* MARKET ENGINE */
function updateMarket() {
  for (let s in prices) {
    let change = (Math.random() - 0.5) * 3;
    prices[s] = Math.max(1, prices[s] + change);

    generateCandle(s);
  }

  renderMarket();
  updatePortfolio();
  updateBalance();
  updateChart();
}

/* CANDLE GENERATION */
function generateCandle(stock) {
  let last = prices[stock];

  let open = last;
  let close = last + (Math.random() - 0.5) * 2;
  let high = Math.max(open, close) + Math.random();
  let low = Math.min(open, close) - Math.random();

  candles.push({ open, high, low, close });

  if (candles.length > 30) candles.shift();
}

/* MARKET UI */
function renderMarket() {
  let html = "";

  for (let s in prices) {
    html += `
      <div class="stock">
        <b>${s}</b><br>
        $${prices[s].toFixed(2)}<br>
        <button onclick="buy('${s}')">Buy</button>
        <button onclick="sell('${s}')">Sell</button>
      </div>
    `;
  }

  document.getElementById("market").innerHTML = html;
}

/* BUY/SELL */
function buy(stock) {
  if (balance < prices[stock]) return alert("No money");

  balance -= prices[stock];
  portfolio[stock] = (portfolio[stock] || 0) + 1;

  popup("BUY " + stock);
}

function sell(stock) {
  if (!portfolio[stock]) return;

  portfolio[stock]--;
  balance += prices[stock];

  popup("SELL " + stock);
}

/* POPUP ANIMATION */
function popup(text) {
  let div = document.createElement("div");
  div.innerText = text;
  div.style.position = "fixed";
  div.style.top = "20px";
  div.style.right = "20px";
  div.style.background = "#2563eb";
  div.style.padding = "10px";
  div.style.borderRadius = "8px";
  div.style.animation = "fade 1s ease";

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 1000);
}

/* PORTFOLIO */
function updatePortfolio() {
  let html = "";

  for (let s in portfolio) {
    html += `${s}: ${portfolio[s]}<br>`;
  }

  document.getElementById("portfolio").innerHTML =
    html || "No holdings";
}

/* BALANCE */
function updateBalance() {
  document.getElementById("balance").innerText =
    "Balance: $" + balance.toFixed(2);
}

/* CHART + INDICATORS */
function updateChart() {
  let total = balance;

  for (let s in portfolio) {
    total += portfolio[s] * prices[s];
  }

  chartData.push(total);
  if (chartData.length > 40) chartData.shift();

  calculateMA();
  calculateRSI();

  drawChart();
}

/* MOVING AVERAGE */
function calculateMA() {
  let sum = 0;
  maLine = [];

  for (let i = 0; i < chartData.length; i++) {
    sum += chartData[i];
    maLine.push(sum / (i + 1));
  }
}

/* RSI (SIMPLIFIED) */
function calculateRSI() {
  rsiLine = [];

  for (let i = 1; i < chartData.length; i++) {
    let gain = Math.max(0, chartData[i] - chartData[i - 1]);
    let loss = Math.max(0, chartData[i - 1] - chartData[i]);

    let rsi = 100 - (100 / (1 + (gain / (loss + 1))));
    rsiLine.push(rsi);
  }
}

/* DRAW CHART */
function drawChart() {
  let canvas = document.getElementById("chart");
  let ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* PRICE LINE */
  ctx.beginPath();
  for (let i = 0; i < chartData.length; i++) {
    let y = canvas.height - chartData[i] / 2;
    ctx.lineTo(i * 10, y);
  }
  ctx.strokeStyle = "#2563eb";
  ctx.stroke();

  /* MA LINE */
  ctx.beginPath();
  for (let i = 0; i < maLine.length; i++) {
    let y = canvas.height - maLine[i] / 2;
    ctx.lineTo(i * 10, y);
  }
  ctx.strokeStyle = "orange";
  ctx.stroke();
}