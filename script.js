let balance = 100;
let portfolio = {};
let step = 0;

/* FAKE MARKET */
let stocks = [
  { name: "APPLE", price: 150 },
  { name: "TESLA", price: 220 },
  { name: "BITCOIN", price: 30000 }
];

/* LOGIN */
function startApp() {
  const username = document.getElementById("usernameInput").value;

  if (!username) return alert("Enter username");

  localStorage.setItem("username", username);
  localStorage.setItem("balance", 100);

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  loadApp();
}

/* LOAD APP */
function loadApp() {
  const username = localStorage.getItem("username");

  document.getElementById("welcome").innerText =
    "Welcome " + username;

  updateMarket();
  updatePortfolio();
  updateBalance();

  setInterval(updatePrices, 3000);
}

/* MARKET PRICES CHANGE */
function updatePrices() {
  stocks.forEach(s => {
    let change = (Math.random() - 0.5) * 10;
    s.price = Math.max(1, s.price + change);
  });

  updateMarket();
}

/* MARKET UI */
function updateMarket() {
  let html = "";

  stocks.forEach((s, i) => {
    html += `
      <div class="stock">
        <b>${s.name}</b><br>
        $${s.price.toFixed(2)}<br>
        <button onclick="buy(${i})">Buy</button>
        <button onclick="sell(${i})">Sell</button>
      </div>
    `;
  });

  document.getElementById("market").innerHTML = html;
}

/* BUY */
function buy(i) {
  let stock = stocks[i];

  if (balance < stock.price) {
    alert("Not enough money");
    return;
  }

  balance -= stock.price;

  portfolio[stock.name] =
    (portfolio[stock.name] || 0) + 1;

  updateAll();
}

/* SELL */
function sell(i) {
  let stock = stocks[i];

  if (!portfolio[stock.name]) return;

  portfolio[stock.name] -= 1;
  balance += stock.price;

  updateAll();
}

/* PORTFOLIO */
function updatePortfolio() {
  let html = "";

  for (let key in portfolio) {
    html += `<div>${key}: ${portfolio[key]}</div>`;
  }

  document.getElementById("portfolio").innerHTML = html;
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

/* TUTORIAL (10 PAGES) */
let tutorialSteps = [
  "Welcome! This app teaches you trading safely.",
  "You start with $100 virtual money.",
  "Prices change every few seconds.",
  "Buy low, sell high to earn profit.",
  "Each stock behaves randomly like real markets.",
  "Your goal is to grow your balance.",
  "You can view your portfolio anytime.",
  "Losses are normal — this is practice.",
  "Learn patience, not gambling.",
  "Now go trade and have fun!"
];

function openTutorial() {
  document.getElementById("tutorial").classList.remove("hidden");
  step = 0;
  showStep();
}

function showStep() {
  document.getElementById("tText").innerText =
    tutorialSteps[step];
}

function nextStep() {
  step++;
  if (step >= tutorialSteps.length) {
    closeTutorial();
    return;
  }
  showStep();
}

function closeTutorial() {
  document.getElementById("tutorial").classList.add("hidden");
}