let balance = Number(localStorage.getItem("balance")) || 100;
let username = localStorage.getItem("username") || "";
let portfolio = JSON.parse(localStorage.getItem("portfolio") || "{}");

/* MARKET */
let prices = {
  PENNY: 2,
  GAMESTOP: 15,
  APPLE: 150,
  TESLA: 250,
  AMAZON: 3200,
  BITCOIN: 45000,
  GOLD: 2000
};

/* 🔊 SOUND SYSTEM */
const clickSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const buySound = new Audio("https://actions.google.com/sounds/v1/cash_register/coins.ogg");
const sellSound = new Audio("https://actions.google.com/sounds/v1/cash_register/coins_long.ogg");

/* TUTORIAL (LONG BUSINESS STYLE) */
let tutorial = [
  "Welcome to Trade Terminal.",
  "This is a professional trading simulator.",
  "You start with $100 virtual capital.",
  "Your goal is to grow your account through smart decisions.",
  "Markets include low-risk and high-risk assets.",
  "Cheap assets move fast but are unstable.",
  "Expensive assets move slower but are more powerful.",
  "Bitcoin is highly volatile — high risk, high reward.",
  "Gold is stable and safer for beginners.",
  "Every price changes every few seconds.",
  "Buy when price is low, sell when higher.",
  "Your portfolio tracks all holdings automatically.",
  "Your balance is updated instantly after each trade.",
  "All progress is saved in your browser.",
  "Even if you close or refresh, your account stays.",
  "Now you are ready to start trading."
];

let step = 0;

/* SAVE */
function save() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("username", username);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

/* START */
function startApp() {
  let input = document.getElementById("usernameInput").value;

  if (input) {
    username = input;
    save();
  }

  clickSound.play();

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("tutorialScreen").classList.remove("hidden");

  showTutorial();
}

/* TUTORIAL */
function showTutorial() {
  document.getElementById("tutorialText").innerText = tutorial[step];
}

function nextTutorial() {
  clickSound.play();

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

/* MARKET */
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

/* PRICE UPDATE */
function updatePrices() {
  for (let s in prices) {
    let change = (Math.random() - 0.5) * 10;
    prices[s] = Math.max(1, prices[s] + change);
  }

  renderMarket();
  updateBalance();
  updatePortfolio();
}

/* BUY */
function buy(stock) {
  clickSound.play();

  if (balance < prices[stock]) return alert("Not enough money");

  balance -= prices[stock];
  portfolio[stock] = (portfolio[stock] || 0) + 1;

  buySound.play();
  save();
}

/* SELL */
function sell(stock) {
  clickSound.play();

  if (!portfolio[stock]) return alert("No shares");

  let total = portfolio[stock] * prices[stock];

  let ok = confirm(
    `Sell ${portfolio[stock]} ${stock}?\n\nYou receive: $${total.toFixed(2)}`
  );

  if (!ok) return;

  balance += total;
  portfolio[stock] = 0;

  sellSound.play();
  save();
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