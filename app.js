const screens = [...document.querySelectorAll('.screen')];
const $ = id => document.getElementById(id);
let timerHandle;
let secondsLeft = 600;
let questStep = 0;

const missions = [
  {
    eyebrow: 'YOUR TREASURE HUNT STARTS HERE',
    title: 'Start at Island Treasures',
    copy: 'Ask the Island Treasures team for the first secret code to begin your treasure hunt.',
    destination: 'Island Treasures',
    code: 'ISLAND'
  },
  {
    eyebrow: 'THE NEXT CLUE IS INSIDE',
    title: 'Continue to Diamonds International',
    copy: 'Enter Diamonds International and follow the route through the store to find the second secret code.',
    destination: 'Diamonds International',
    code: 'DIAMOND'
  },
  {
    eyebrow: 'FINAL STOP · CLAIM YOUR PRIZE',
    title: 'Finish at the souvenir shop',
    copy: 'Go downstairs to the souvenir shop, find the final code and show the completed screen to receive your free souvenir.',
    destination: 'Souvenir shop · downstairs',
    code: 'TREASURE'
  }
];

function show(id) {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const statuses = {
    welcome: 'Guest Wi-Fi', online: 'Connected · 10 min', expired: 'Access paused',
    unlocked: 'Connected · 60 min', declined: 'Connected · 60 min', quest: 'Connected · Mission active', reward: 'Connected · Reward unlocked'
  };
  $('networkStatus').textContent = statuses[id] || 'Guest Wi-Fi';
}

function updateTimer() {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  $('timerMinutes').textContent = String(m).padStart(2, '0');
  $('timerSeconds').textContent = String(s).padStart(2, '0');
}

function startTimer() {
  clearInterval(timerHandle);
  secondsLeft = 600;
  updateTimer();
  show('online');
  // Accelerated prototype: one displayed minute passes every six real seconds.
  timerHandle = setInterval(() => {
    secondsLeft = Math.max(0, secondsLeft - 10);
    updateTimer();
    if (secondsLeft === 0) expireSession();
  }, 1000);
}

function expireSession() {
  clearInterval(timerHandle);
  show('expired');
}

function renderMission() {
  if (questStep >= missions.length) {
    $('rewardCode').textContent = `IT-${Math.floor(1000 + Math.random() * 9000)}`;
    return show('reward');
  }
  const mission = missions[questStep];
  $('questStepLabel').textContent = `MISSION ${questStep + 1} OF ${missions.length}`;
  $('questProgress').style.width = `${((questStep + 1) / missions.length) * 100}%`;
  $('missionBadge').textContent = `STOP ${questStep + 1}`;
  $('missionEyebrow').textContent = mission.eyebrow;
  $('missionTitle').textContent = mission.title;
  $('missionCopy').textContent = mission.copy;
  $('missionDestination').textContent = mission.destination;
  $('missionHint').innerHTML = `Prototype code: <strong>${mission.code}</strong>`;
  $('missionCode').value = '';
  $('missionMessage').textContent = '';
  show('quest');
}

$('connectButton').addEventListener('click', () => {
  if (!$('terms').checked) return alert('Please accept the guest Wi-Fi terms.');
  startTimer();
});
$('expireButton').addEventListener('click', expireSession);
$('wifiCodeForm').addEventListener('submit', event => {
  event.preventDefault();
  const code = $('wifiCode').value.trim().toUpperCase();
  if (code !== 'ISLAND') {
    $('wifiCodeMessage').textContent = 'That code is not valid. Ask the Island Treasures team for today’s code.';
    return;
  }
  $('wifiCodeMessage').textContent = 'Correct — 60 minutes unlocked!';
  setTimeout(() => show('unlocked'), 650);
});
$('acceptQuest').addEventListener('click', () => { questStep = 0; renderMission(); });
$('declineQuest').addEventListener('click', () => show('declined'));
$('changeMind').addEventListener('click', () => { questStep = 0; renderMission(); });
$('missionForm').addEventListener('submit', event => {
  event.preventDefault();
  const code = $('missionCode').value.trim().toUpperCase();
  if (code !== missions[questStep].code) {
    $('missionMessage').textContent = 'That is not the treasure code for this stop. Try again.';
    return;
  }
  $('missionMessage').textContent = 'Correct! The next destination is unlocked.';
  setTimeout(() => { questStep += 1; renderMission(); }, 650);
});
function reset() {
  clearInterval(timerHandle);
  secondsLeft = 600;
  questStep = 0;
  $('wifiCode').value = '';
  $('wifiCodeMessage').textContent = '';
  show('welcome');
}
$('resetButton').addEventListener('click', reset);
$('finishButton').addEventListener('click', reset);
show('welcome');
