let balance = 100;
let portfolio = {};
let prices = {
  APPLE: 10,
  TESLA: 20,
  BITCOIN: 50
};

let chartData = [];
let tutorialStep = 0;

/* TUTORIAL */
let tutorial = [
  "Welcome to TradeLearn Pro.",
  "You start with $100 virtual money.",
  "This is a real trading simulator.",
  "Buy low, sell high to make profit.",
  "Markets move every few seconds.",
  "You can trade Apple, Tesla, and Bitcoin.",
  "Each asset behaves differently.",
  "Your portfolio shows your holdings.",
  "Chart shows total account value.",
  "Finish tutorial to start trading."
];

/* LOGIN */
function startApp() {
  let username = document.getElementById("usernameInput").value;
  if (!username) return alert("Enter username");

  localStorage.setItem("username", username);
  localStorage.setItem("balance", 100);

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("tutorialScreen").classList.remove("hidden");

  showTutorial();
}

/* TUTORIAL */
function showTutorial() {
  document.getElementById("tutorialText").innerText =
    tutorial[tutorialStep];
}

function nextTutorial() {
  tutorialStep++;

  if (tutorialStep >= tutorial.length) {
    finishTutorial();
    return;
  }

  showTutorial();
}

function finishTutorial() {
  document.getElementById("tutorialScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  let username = localStorage.getItem("username");

  document.getElementById("welcome").innerText =
    "Welcome " + username;

  renderMarket();
  setInterval(updatePrices, 2500);
}

/* MARKET */
function renderMarket() {
  let html = "";

  for (let stock in prices) {
    html += `
      <div class="stock">
        <b>${stock}</b><br>
        Price: $${prices[stock].toFixed(2)}<br>
        <button onclick="buy('${stock}')">Buy</button>
        <button onclick="sell('${stock}')">Sell</button>
      </div>
    `;
  }

  document.getElementById("market").innerHTML = html;
}

/* PRICE MOVEMENT */
function updatePrices() {
  for (let stock in prices) {
    let change = (Math.random() - 0.5) * 3;
    prices[stock] += change;
    prices[stock] = Math.max(1, prices[stock]);
  }

  renderMarket();
  updatePortfolio();
  updateBalance();
  updateChart();
}

/* BUY */
function buy(stock) {
  if (balance < prices[stock]) return alert("Not enough balance");

  balance -= prices[stock];

  portfolio[stock] = (portfolio[stock] || 0) + 1;

  updateAll();
}

/* SELL */
function sell(stock) {
  if (!portfolio[stock]) return;

  portfolio[stock] -= 1;
  balance += prices[stock];

  updateAll();
}

/* PORTFOLIO */
function updatePortfolio() {
  let html = "";

  for (let stock in portfolio) {
    html += `${stock}: ${portfolio[stock]}<br>`;
  }

  document.getElementById("portfolio").innerHTML =
    html || "No holdings";
}

/* BALANCE */
function updateBalance() {
  document.getElementById("balance").innerText =
    "Balance: $" + balance.toFixed(2);
}

/* UPDATE ALL */
function updateAll() {
  updatePortfolio();
  updateBalance();
}

/* CHART */
function updateChart() {
  let totalValue = balance;

  for (let stock in portfolio) {
    totalValue += portfolio[stock] * prices[stock];
  }

  chartData.push(totalValue);

  if (chartData.length > 25) chartData.shift();

  drawChart();
}

function drawChart() {
  let canvas = document.getElementById("chart");
  let ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();

  let startY = canvas.height - chartData[0] / 2;
  ctx.moveTo(0, startY);

  for (let i = 0; i < chartData.length; i++) {
    ctx.lineTo(i * 14, canvas.height - chartData[i] / 2);
  }

  ctx.strokeStyle = "#00ff88";
  ctx.stroke();
}