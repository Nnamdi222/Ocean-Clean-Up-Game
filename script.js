const gameArea = document.getElementById("gameArea");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const waterFill = document.getElementById("waterFill");
const waterPercent = document.getElementById("waterPercent");
const highScoreDisplay = document.getElementById("highScore");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const overlay = document.getElementById("overlay");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const playAgain = document.getElementById("playAgain");

const factBox = document.getElementById("factBox");

let score = 0;
let water = 0;
let time = 60;
let gameRunning = false;

let timer;
let spawnTimer;

const facts = [
"Every person deserves clean water.",
"Clean water improves health.",
"charity: water funds clean water projects worldwide.",
"Protecting oceans protects drinking water.",
"Small actions create big change."
];

highScoreDisplay.textContent =
localStorage.getItem("highScore") || 0;

function updateDisplays(){

scoreDisplay.textContent = score;

waterPercent.textContent = water + "%";

waterFill.style.width = water + "%";

timerDisplay.textContent = time;

}

function randomFact(){

factBox.textContent =
facts[Math.floor(Math.random()*facts.length)];

}

function spawnObject(){

if(!gameRunning) return;

const item=document.createElement("div");

const r=Math.random();

if(r<0.6){

item.className="trash";

const trash=["🥤","🥫","🛍️"];

item.textContent=
trash[Math.floor(Math.random()*trash.length)];

item.dataset.type="trash";

}else if(r<0.8){

item.className="fish";

item.textContent="🐟";

item.dataset.type="fish";

}else{

item.className="turtle";

item.textContent="🐢";

item.dataset.type="turtle";

}

item.style.left=Math.random()*90+"%";

item.style.top=Math.random()*75+"%";

gameArea.appendChild(item);

item.onclick=function(){

if(!gameRunning) return;

if(item.dataset.type==="trash"){

score+=10;

water=Math.min(100,water+5);

showPoints("+10","green",item);

}else if(item.dataset.type==="fish"){

score=Math.max(0,score-10);

water=Math.max(0,water-5);

showPoints("-10","red",item);

}else{

score=Math.max(0,score-15);

showPoints("-15","red",item);

}

updateDisplays();

randomFact();

item.remove();

checkWin();

};

setTimeout(()=>{

if(item.parentNode){

item.remove();

}

},5000);

}

function showPoints(text,color,item){

const p=document.createElement("span");

p.className="points";

p.textContent=text;

p.style.color=color;

p.style.left=item.style.left;

p.style.top=item.style.top;

gameArea.appendChild(p);

setTimeout(()=>{

p.remove();

},1000);

}

function startGame(){

if(gameRunning) return;

gameRunning=true;

score=0;

water=0;

time=60;

updateDisplays();

gameArea.innerHTML="";

timer=setInterval(()=>{

time--;

updateDisplays();

if(time<=0){

loseGame();

}

},1000);

spawnTimer=setInterval(spawnObject,700);

}

function resetGame(){

clearInterval(timer);

clearInterval(spawnTimer);

gameRunning=false;

score=0;

water=0;

time=60;

overlay.classList.add("hidden");

gameArea.innerHTML="";

updateDisplays();

}

function checkWin(){

if(water>=100){

clearInterval(timer);

clearInterval(spawnTimer);

gameRunning=false;

overlay.classList.remove("hidden");

resultTitle.textContent="You Win!";

resultMessage.textContent="You restored clean water to the island!";

confetti({

particleCount:200,

spread:100,

origin:{y:.6}

});

if(score>

Number(localStorage.getItem("highScore")||0)){

localStorage.setItem("highScore",score);

highScoreDisplay.textContent=score;

}

}

}

function loseGame(){

clearInterval(timer);

clearInterval(spawnTimer);

gameRunning=false;

overlay.classList.remove("hidden");

resultTitle.textContent="Time's Up";

resultMessage.textContent="Try again and remove more pollution!";

}

startBtn.onclick=startGame;

resetBtn.onclick=resetGame;

playAgain.onclick=resetGame;

updateDisplays();
