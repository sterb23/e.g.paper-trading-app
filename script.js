let balance = Number(localStorage.getItem("balance")) || 100;
let username = localStorage.getItem("username") || "";
let portfolio = JSON.parse(localStorage.getItem("portfolio") || "{}");

/* 20+ REAL STOCKS (SIMULATED PRICES) */
let prices = {
  AAPL: 180,
  TSLA: 250,
  MSFT: 420,
  AMZN: 3200,
  GOOG: 2800,
  META: 500,
  NVDA: 900,
  NFLX: 600,
  AMD: 150,
  INTC: 45,
  IBM: 180,
  ORCL: 140,
  DIS: 110,
  UBER: 75,
  SPOT: 320,
  SHOP: 85,
  PYPL: 65,
  COIN: 180,
  BAC: 40,
  JPM: 160,
  GOLD: 2000,
  BTC: 45000
};

/* BEGINNER TIPS */
let tips = {
  AAPL: "Low risk, good for beginners",
  TSLA: "High volatility, risky but profitable",
  MSFT: "Stable long-term growth",
  AMZN: "Expensive but strong company",
  GOOG: "Stable tech giant",
  META: "Medium risk social media stock",
  NVDA: "High growth AI stock",
  NFLX: "Volatile streaming stock",
  AMD: "Good beginner tech stock",
  INTC: "Slow but stable chip stock",
  IBM: "Very stable, low risk",
  ORCL: "Enterprise software stability",
  DIS: "Entertainment long-term hold",
  UBER: "Risky growth stock",
  SPOT: "Music streaming volatility",
  SHOP: "E-commerce growth stock",
  PYPL: "Payment system stability",
  COIN: "Crypto-related high risk",
  BAC: "Banking stable dividend",
  JPM: "Very stable banking stock",
  GOLD: "Safe asset, low volatility",
  BTC: "Extreme volatility crypto"
};

/* SAVE */
function save() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("username", username);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

/* START APP */
function startApp() {
  let input = document.getElementById("usernameInput").value;

  if (input) {
    username = input;
    save();
  }

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("tutorialScreen").classList.remove("hidden");

  showTutorial();
}

/* TUTORIAL */
let tutorial = [
  "Welcome to Trade Simulator Pro.",
  "You now have access to 20+ real stocks.",
  "Each stock behaves differently.",
  "Blue chip stocks = safer.",
  "Tech stocks = medium risk.",
  "Crypto = extremely volatile.",
  "Your goal is to grow your balance.",
  "Click BUY to purchase assets.",
  "Click SELL to liquidate holdings.",
  "Click CHART to view candlestick data.",
  "Begin trading when ready."
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

  document.getElementById("welcome").innerText =
    "Welcome " + username;

  renderMarket();
  updateBalance();

  setInterval(updatePrices, 2500);
}

/* MARKET UI */
function renderMarket() {
  let html = "";

  for (let s in prices) {
    html += `
      <div class="stock">
        <b>${s}</b><br>

        Price: $${prices[s].toFixed(2)}<br>

        <span style="color:red;font-size:11px">
          ${tips[s] || "No beginner info"}
        </span><br>

        <button onclick="buy('${s}')">Buy</button>
        <button onclick="sell('${s}')">Sell</button>

        ${portfolio[s] ? `<button onclick="viewChart('${s}')">Candlestick Chart</button>` : ""}
      </div>
    `;
  }

  document.getElementById("market").innerHTML = html;
}

/* PRICE UPDATE */
function updatePrices() {
  for (let s in prices) {
    let change = (Math.random() - 0.5) * (prices[s] * 0.02);
    prices[s] = Math.max(1, prices[s] + change);
  }

  renderMarket();
  updateBalance();
}

/* BUY */
function buy(stock) {
  if (balance < prices[stock]) return alert("Not enough money");

  balance -= prices[stock];
  portfolio[stock] = (portfolio[stock] || 0) + 1;

  save();
}

/* SELL (WITH PREVIEW) */
function sell(stock) {
  if (!portfolio[stock]) return alert("No shares");

  let total = portfolio[stock] * prices[stock];

  let ok = confirm(
    `Sell ${portfolio[stock]} ${stock}?\n\nYou get: $${total.toFixed(2)}`
  );

  if (!ok) return;

  balance += total;
  portfolio[stock] = 0;

  save();
}

/* VIEW CHART BUTTON */
function viewChart(stock) {
  alert(
    `📊 Candlestick View: ${stock}\n\n` +
    `Open: ${prices[stock].toFixed(2)}\n` +
    `High: ${(prices[stock] * 1.02).toFixed(2)}\n` +
    `Low: ${(prices[stock] * 0.98).toFixed(2)}\n` +
    `Close: ${prices[stock].toFixed(2)}\n\n` +
    `(Real chart system can be added next upgrade)`
  );
}

/* BALANCE */
function updateBalance() {
  document.getElementById("balance").innerText =
    "Balance: $" + balance.toFixed(2);
}