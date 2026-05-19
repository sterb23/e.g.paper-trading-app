/* =====================================================
   TRADE TERMINAL PRO — FULL VERSION (WITH LOGIN SYSTEM)
===================================================== */

/* ================= SESSION ================= */
let session = JSON.parse(localStorage.getItem("session")) || {
  loggedIn: false,
  username: "",
  firstTime: true
};

let balance = Number(localStorage.getItem("balance"));
if (!balance) balance = 100;

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

/* ================= HISTORY ================= */
let history = {};
for (let s in prices) history[s] = [];

/* ================= SAVE SYSTEM ================= */
function save() {
  localStorage.setItem("session", JSON.stringify(session));
  localStorage.setItem("balance", balance);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
  localStorage.setItem("trades", JSON.stringify(trades));
}

/* ================= INIT ================= */
window.onload = () => {
  if (session.loggedIn) {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    document.getElementById("welcome").innerText =
      "Welcome " + session.username;

    renderMarket();
    updateUI();

    setInterval(updatePrices, 2000);
  } else {
    document.getElementById("loginScreen").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
  }
};

/* ================= LOGIN ================= */
function startApp() {
  let input = document.getElementById("usernameInput").value;

  if (!input) return alert("Enter a username");

  session.username = input;
  session.loggedIn = true;

  /* first time setup */
  if (session.firstTime) {
    balance = 100;
    portfolio = {};
    trades = [];
    session.firstTime = false;
  }

  save();

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("welcome").innerText =
    "Welcome " + session.username;

  renderMarket();
  updateUI();

  setInterval(updatePrices, 2000);
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

    let volatility = open * 0.02;
    let change = (Math.random() - 0.5) * volatility;

    let close = Math.max(1, open + change);

    prices[s] = close;

    history[s].push({
      open,
      close,
      high: Math.max(open, close),
      low: Math.min(open, close)
    });

    if (history[s].length > 120) history[s].shift();
  }

  renderMarket();
  updateUI();
}

/* ================= BUY ================= */
function buy(stock) {
  if (balance < prices[stock]) return alert("Not enough money");

  balance -= prices[stock];
  portfolio[stock] = (portfolio[stock] || 0) + 1;

  trades.push({ type: "BUY", stock, price: prices[stock], time: Date.now() });

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

  trades.push({ type: "SELL", stock, price: prices[stock], time: Date.now() });

  save();
  updateUI();
}

/* ================= UI ================= */
function updateUI() {
  updateBalance();
  updatePortfolio();
}

/* ================= BALANCE ================= */
function updateBalance() {
  document.getElementById("balance").innerText =
    "Balance: $" + balance.toFixed(2);
}

/* ================= PORTFOLIO ================= */
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

/* ================= LOGOUT BUTTON (optional HTML hook) ================= */
/* call logout() from button */