/* ================= SESSION ================= */
let session = JSON.parse(localStorage.getItem("session")) || {
  loggedIn: false,
  username: "",
  firstTime: true
};

let balance = Number(localStorage.getItem("balance")) || 100;
let portfolio = JSON.parse(localStorage.getItem("portfolio") || "{}");

/* ================= MARKET ================= */
let prices = {
  AAPL: 180, TSLA: 250, MSFT: 420, AMZN: 3200,
  GOOG: 2800, META: 500, NVDA: 900, NFLX: 600
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
  if (session.loggedIn) {
    enterApp();
  } else {
    document.getElementById("loginScreen").classList.remove("hidden");
  }

  setInterval(updatePrices, 2000);
};

/* ================= LOGIN ================= */
function startApp() {
  let name = document.getElementById("usernameInput").value;
  if (!name) return alert("Enter username");

  session.username = name;
  session.loggedIn = true;

  if (session.firstTime) {
    balance = 100;
    portfolio = {};
    session.firstTime = false;
  }

  save();
  enterApp();
}

/* ================= ENTER APP ================= */
function enterApp() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("welcome").innerText =
    session.username;

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
    let change = (Math.random() - 0.5) * (open * 0.02);
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

/* ================= TRADE ================= */
function buy(stock) {
  if (balance < prices[stock]) return;

  balance -= prices[stock];
  portfolio[stock] = (portfolio[stock] || 0) + 1;
  save();
  updateUI();
}

function sell(stock) {
  if (!portfolio[stock]) return;

  balance += prices[stock] * portfolio[stock];
  portfolio[stock] = 0;

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

/* ================= CHART ================= */
function openChart(stock) {
  let w = window.open("", "_blank", "width=800,height=500");

  let data = history[stock];

  w.document.write("<canvas id='c'></canvas>");

  setTimeout(() => {
    let c = w.document.getElementById("c");
    let ctx = c.getContext("2d");

    c.width = 800;
    c.height = 500;

    let max = Math.max(...data.map(d => d.high));
    let min = Math.min(...data.map(d => d.low));
    let range = max - min;

    data.forEach((d, i) => {
      let x = i * 6;
      let o = 500 - ((d.open - min) / range) * 500;
      let cl = 500 - ((d.close - min) / range) * 500;

      ctx.fillStyle = d.close > d.open ? "green" : "red";
      ctx.fillRect(x, Math.min(o, cl), 4, Math.abs(o - cl));
    });
  }, 200);
}