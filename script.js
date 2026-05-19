/* ================= STATE ================= */
let session = JSON.parse(localStorage.getItem("session")) || {
  loggedIn: false,
  username: "",
  tutorialDone: false
};

let balance = Number(localStorage.getItem("balance")) || 100;
let portfolio = JSON.parse(localStorage.getItem("portfolio") || "{}");

/* ================= 30+ ASSETS ================= */
let assets = {
  AAPL:{p:180,v:0.012}, TSLA:{p:250,v:0.02}, MSFT:{p:420,v:0.01},
  AMZN:{p:3200,v:0.015}, GOOG:{p:2800,v:0.012}, META:{p:500,v:0.018},
  NVDA:{p:900,v:0.025}, NFLX:{p:600,v:0.02}, AMD:{p:150,v:0.03},
  IBM:{p:140,v:0.01}, ORCL:{p:120,v:0.015}, DIS:{p:110,v:0.02},
  KO:{p:60,v:0.008}, PEP:{p:170,v:0.009}, BA:{p:220,v:0.02},

  BTC:{p:42000,v:0.04}, ETH:{p:2200,v:0.05}, SOL:{p:120,v:0.06},
  XRP:{p:0.6,v:0.07},

  SPX:{p:4800,v:0.01}, NASDAQ:{p:17000,v:0.012},

  GOLD:{p:2000,v:0.008}, OIL:{p:75,v:0.03}, SILVER:{p:25,v:0.02},

  EURUSD:{p:1.09,v:0.001}, GBPUSD:{p:1.27,v:0.0015},

  TSMC:{p:100,v:0.02}, SHOP:{p:70,v:0.03},
  SNAP:{p:12,v:0.04}, UBER:{p:60,v:0.02}
};

/* ================= HISTORY ================= */
let history = {};
for(let a in assets) history[a] = [];

/* ================= SAVE ================= */
function save(){
  localStorage.setItem("session",JSON.stringify(session));
  localStorage.setItem("balance",balance);
  localStorage.setItem("portfolio",JSON.stringify(portfolio));
}

/* ================= INIT ================= */
window.onload = () => {
  if(session.loggedIn) enterApp();
  else document.getElementById("loginScreen").classList.remove("hidden");

  setInterval(updateMarket, 1000);
};

/* ================= LOGIN ================= */
function startApp(){
  let name = document.getElementById("usernameInput").value;
  if(!name) return;

  session.username = name;
  session.loggedIn = true;
  save();

  document.getElementById("loginScreen").classList.add("hidden");

  if(!session.tutorialDone) tutorialStart();
  else enterApp();
}

/* ================= TUTORIAL ================= */
let tutorial = [
  "Welcome to V8 Trading Terminal",
  "Swipe charts to move through time",
  "Real candlestick data engine",
  "Let’s trade"
];

let step = 0;

function tutorialStart(){
  document.getElementById("tutorialScreen").classList.remove("hidden");
  showTutorial();
}

function showTutorial(){
  document.getElementById("tutorialText").innerText = tutorial[step];
}

function nextTutorial(){
  step++;
  if(step>=tutorial.length){
    session.tutorialDone=true;
    save();
    document.getElementById("tutorialScreen").classList.add("hidden");
    enterApp();
    return;
  }
  showTutorial();
}

/* ================= APP ================= */
function enterApp(){
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("welcome").innerText = session.username;

  renderMarket();
  updateUI();
}

/* ================= MARKET ================= */
function renderMarket(){
  let html="";

  for(let a in assets){
    html+=`
      <div class="asset">
        <b>${a}</b><br>
        $${assets[a].p.toFixed(2)}<br>
        <button onclick="buy('${a}')">Buy</button>
        <button onclick="sell('${a}')">Sell</button>
        <button onclick="openChart('${a}')">Chart</button>
      </div>
    `;
  }

  document.getElementById("market").innerHTML=html;
}

/* ================= MARKET ENGINE ================= */
function updateMarket(){
  for(let a in assets){
    let o=assets[a];

    let change=(Math.random()-0.5)*o.p*o.v;
    let c=Math.max(0.01,o.p+change);

    o.p=c;

    let h=c+Math.random()*o.v*o.p;
    let l=c-Math.random()*o.v*o.p;

    history[a].push({o:o.p,c,h,l});
    if(history[a].length>200) history[a].shift();
  }

  renderMarket();
  updateUI();
}

/* ================= TRADING ================= */
function buy(a){
  if(balance<assets[a].p)return;
  balance-=assets[a].p;
  portfolio[a]=(portfolio[a]||0)+1;
  save();
  updateUI();
}

function sell(a){
  if(!portfolio[a])return;
  balance+=assets[a].p*portfolio[a];
  portfolio[a]=0;
  save();
  updateUI();
}

/* ================= UI ================= */
function updateUI(){
  document.getElementById("balance").innerText=balance.toFixed(2);

  let html="";
  let total=0;

  for(let a in portfolio){
    let val=portfolio[a]*assets[a].p;
    total+=val;
    html+=`${a}: ${portfolio[a]} ($${val.toFixed(2)})<br>`;
  }

  document.getElementById("portfolio").innerHTML=html||"No holdings";
  document.getElementById("pnl").innerHTML="Portfolio: $"+total.toFixed(2);
}

/* ================= CHART ================= */
let current=null;
let start=0;
let size=60;
let dragging=false;
let lastX=0;

function openChart(a){
  current=a;
  start=Math.max(0,history[a].length-size);
  document.getElementById("chartModal").classList.remove("hidden");

  setupSwipe();
  drawChart();
}

function closeChart(){
  document.getElementById("chartModal").classList.add("hidden");
}

/* ================= SWIPE ================= */
function setupSwipe(){
  let c=document.getElementById("chartCanvas");

  c.onmousedown=e=>{dragging=true;lastX=e.clientX;}
  c.onmouseup=()=>dragging=false;
  c.onmouseleave=()=>dragging=false;

  c.ontouchstart=e=>{dragging=true;lastX=e.touches[0].clientX;}
  c.ontouchend=()=>dragging=false;

  c.onmousemove=e=>move(e.clientX);
  c.ontouchmove=e=>move(e.touches[0].clientX);
}

function move(x){
  if(!dragging)return;

  let dx=x-lastX;
  lastX=x;

  start-=dx*0.2;
  start=Math.max(0,start);
  let max=Math.max(0,history[current].length-size);
  if(start>max)start=max;

  drawChart();
}

/* ================= DRAW CANDLES ================= */
function drawChart(){
  let c=document.getElementById("chartCanvas");
  let ctx=c.getContext("2d");

  let data=history[current];
  if(!data||data.length<2)return;

  c.width=c.clientWidth;
  c.height=c.clientHeight;

  ctx.clearRect(0,0,c.width,c.height);

  let vis=data.slice(start,start+size);

  let min=Math.min(...vis.map(d=>d.l));
  let max=Math.max(...vis.map(d=>d.h));
  let range=max-min||1;

  let w=c.width/size;

  for(let i=0;i<vis.length;i++){
    let d=vis[i];

    let x=i*w;

    let o=c.height-((d.o-min)/range)*c.height;
    let cl=c.height-((d.c-min)/range)*c.height;
    let h=c.height-((d.h-min)/range)*c.height;
    let l=c.height-((d.l-min)/range)*c.height;

    ctx.strokeStyle="#999";
    ctx.beginPath();
    ctx.moveTo(x+w/2,h);
    ctx.lineTo(x+w/2,l);
    ctx.stroke();

    ctx.fillStyle=d.c>d.o?"#22c55e":"#ef4444";

    ctx.fillRect(x,Math.min(o,cl),w*0.7,Math.abs(o-cl));
  }
}