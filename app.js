const screens = [...document.querySelectorAll('.screen')];
const $ = id => document.getElementById(id);
const STORAGE_KEY = 'islandTreasuresGuestV3';
const DEMO_MODE = new URLSearchParams(location.search).get('demo') === '1';
const PREVIEW_MODE = DEMO_MODE || location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname.endsWith('.github.io');
const SESSION_SECONDS = DEMO_MODE ? 20 : 600;
let timerHandle;

async function portalRequest(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  let payload;
  try { payload = await response.json(); }
  catch { throw new Error('invalid_response'); }

  if (!response.ok || !payload.ok) throw new Error(payload.error || 'request_failed');
  return payload;
}

function portalErrorMessage(error) {
  const messages = {
    invalid_code: 'That code is not valid. Ask the Island Treasures cashier for today\'s code.',
    already_used: 'That code has already been used. Please ask the cashier for help.',
    expired: 'That code has expired. Please ask the cashier for today\'s code.',
    rate_limited: 'Too many attempts. Please wait a moment and try again.',
    invalid_response: 'The Wi-Fi service did not return a valid response. Please ask the team for help.'
  };
  return messages[error.message] || 'We could not connect to the Wi-Fi service. Please try again.';
}

const CODE_HASHES = {
  wifi: '96abf3e6277b59780f196acfef3c3e897603f7161a9d989c6d81bf0433acf3a1',
  temple: '9de05beff439add983f26430b8ae6846a0247071c0e640e401c297d22d6ff0d1',
  diamond: '6d924f7bddebb3a59fdc05c0e6eab5623c535e3538946a8301ca0fdd7bf61f76',
  booty: '613b11c983201f40b8637cd79c401ab0d2529ba7581ba33bd102653b097c5076'
};

const missions = [
  { eyebrow: 'YOU ARE ALREADY AT THE FIRST STOP', title: 'Ask the Island Treasures cashier', copy: 'Ask for the first Treasure Quest code. It is different from the Wi-Fi code you just entered.', destination: 'Island Treasures · cashier', action: 'Ask for code #1', hash: CODE_HASHES.temple, visual: ['stop-one', '★', 'ISLAND TREASURES', 'Temple of Fun'] },
  { eyebrow: 'FOLLOW THE SHORTCUT THROUGH THE STORE', title: 'Continue to Diamonds International', copy: 'Walk back into Diamonds International and ask its team for the second Treasure Quest code.', destination: 'Diamonds International', action: 'Ask for code #2', hash: CODE_HASHES.diamond, visual: ['stop-two', '◆', 'DIAMONDS', 'International'] },
  { eyebrow: 'FINAL STOP · CLAIM YOUR PRIZE', title: 'Take the elevator to Island Booty', copy: 'Inside Diamonds, take the elevator downstairs. At Island Booty, ask for the final code and enter it here.', destination: 'Island Booty · downstairs', action: 'Final code + prize', hash: CODE_HASHES.booty, visual: ['stop-three', '☀', 'ISLAND BOOTY', 'Caribbean Treasures'] }
];

const blankState = () => ({ screen: 'welcome', startedAt: null, questStep: 0, rewardCode: null, claimed: false });
let state = loadState();

function loadState() {
  try { return { ...blankState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return blankState(); }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function show(id, persist = true) {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  const statuses = { welcome: 'Guest Wi-Fi', online: 'Connected · 10 min', expired: 'Access paused', unlocked: 'Connected · 60 min', declined: 'Connected · 60 min', quest: 'Connected · Mission active', reward: 'Reward unlocked' };
  $('networkStatus').textContent = statuses[id] || 'Guest Wi-Fi';
  if (persist) { state.screen = id; saveState(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function secondsRemaining() {
  if (!state.startedAt) return SESSION_SECONDS;
  return Math.max(0, SESSION_SECONDS - Math.floor((Date.now() - state.startedAt) / 1000));
}

function updateTimer() {
  const remaining = secondsRemaining();
  $('timerMinutes').textContent = String(Math.floor(remaining / 60)).padStart(2, '0');
  $('timerSeconds').textContent = String(remaining % 60).padStart(2, '0');
  if (remaining === 0) expireSession();
}

function startTimer() {
  clearInterval(timerHandle);
  state.startedAt = Date.now();
  saveState();
  show('online');
  updateTimer();
  timerHandle = setInterval(updateTimer, 1000);
}

function resumeTimer() {
  clearInterval(timerHandle);
  if (secondsRemaining() <= 0) return expireSession();
  updateTimer();
  timerHandle = setInterval(updateTimer, 1000);
}

function expireSession() { clearInterval(timerHandle); show('expired'); }

async function digest(value) {
  const data = new TextEncoder().encode(value.trim().toUpperCase());
  const result = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(result)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function makeRewardCode() {
  if (state.rewardCode) return state.rewardCode;
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  state.rewardCode = `IT-${String(1000 + (values[0] % 9000))}`;
  saveState();
  return state.rewardCode;
}

function renderMission() {
  if (state.questStep >= missions.length) return renderReward();
  const mission = missions[state.questStep];
  $('questStepLabel').textContent = `MISSION ${state.questStep + 1} OF ${missions.length}`;
  $('questProgress').style.width = `${((state.questStep + 1) / missions.length) * 100}%`;
  $('missionBadge').textContent = `STOP ${state.questStep + 1}`;
  $('missionEyebrow').textContent = mission.eyebrow;
  $('missionTitle').textContent = mission.title;
  $('missionCopy').textContent = mission.copy;
  $('missionDestination').textContent = mission.destination;
  $('missionAction').textContent = mission.action;
  const visual = $('missionVisual');
  visual.className = `mission-visual ${mission.visual[0]}`;
  visual.innerHTML = `<span class="visual-icon">${mission.visual[1]}</span><strong>${mission.visual[2]}</strong><small>${mission.visual[3]}</small>`;
  $('missionCode').value = '';
  $('missionMessage').textContent = '';
  show('quest');
}

function renderReward() {
  $('rewardCode').textContent = makeRewardCode();
  $('voucherStatus').textContent = state.claimed ? 'SOUVENIR CLAIMED' : 'READY TO CLAIM TODAY';
  $('claimState').textContent = state.claimed ? 'Claim recorded on this device' : 'Live claim screen';
  $('claimButton').disabled = state.claimed;
  $('claimButton').textContent = state.claimed ? 'Souvenir already claimed' : 'Staff: mark souvenir as claimed';
  document.querySelector('.voucher').classList.toggle('claimed', state.claimed);
  show('reward');
}

$('connectButton').addEventListener('click', async () => {
  if (!$('terms').checked) { $('openTerms').focus(); return alert('Please accept the guest Wi-Fi terms to continue.'); }
  const button = $('connectButton');
  button.disabled = true;
  button.textContent = 'Connecting…';
  try {
    if (!PREVIEW_MODE) await portalRequest('/api/free');
    startTimer();
  } catch (error) {
    alert(portalErrorMessage(error));
  } finally {
    button.disabled = false;
    button.textContent = 'Connect free';
  }
});
$('expireButton').addEventListener('click', expireSession);
$('wifiCodeForm').addEventListener('submit', async event => {
  event.preventDefault();
  const code = $('wifiCode').value.trim();
  const submit = event.submitter;
  if (submit) submit.disabled = true;
  $('wifiCodeMessage').textContent = 'Checking code…';
  try {
    if (PREVIEW_MODE) {
      const valid = await digest(code) === CODE_HASHES.wifi;
      if (!valid) throw new Error('invalid_code');
    } else {
      await portalRequest('/api/code', { code });
    }
    $('wifiCodeMessage').textContent = 'Correct — 60 minutes unlocked!';
    setTimeout(() => show('unlocked'), 500);
  } catch (error) {
    $('wifiCodeMessage').textContent = portalErrorMessage(error);
  } finally {
    if (submit) submit.disabled = false;
  }
});
$('acceptQuest').addEventListener('click', () => { state.questStep = 0; saveState(); renderMission(); });
$('declineQuest').addEventListener('click', () => show('declined'));
$('changeMind').addEventListener('click', renderMission);
$('missionForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (await digest($('missionCode').value) !== missions[state.questStep].hash) { $('missionMessage').textContent = 'That is not the code for this stop. Please ask the team and try again.'; return; }
  $('missionMessage').textContent = state.questStep === missions.length - 1 ? 'Correct — treasure found!' : 'Correct — your next destination is unlocked!';
  state.questStep += 1; saveState();
  setTimeout(renderMission, 500);
});

$('claimButton').addEventListener('click', () => {
  if (state.claimed) return;
  if (!confirm('Staff confirmation: mark this souvenir as claimed? This cannot be undone on this device.')) return;
  state.claimed = true; saveState(); renderReward();
});

function reset() {
  if (state.screen !== 'welcome' && !confirm('Start over and clear the current progress on this device?')) return;
  clearInterval(timerHandle);
  state = blankState(); saveState();
  $('terms').checked = false; $('wifiCode').value = ''; $('wifiCodeMessage').textContent = '';
  show('welcome');
}
$('resetButton').addEventListener('click', reset);
$('finishButton').addEventListener('click', () => show('welcome'));

function wireDialog(openButton, dialog) {
  openButton.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}
wireDialog($('openTerms'), $('termsDialog'));
wireDialog($('openPrivacy'), $('privacyDialog'));

if (DEMO_MODE) document.body.classList.add('demo-mode');
const resumable = ['welcome', 'online', 'expired', 'unlocked', 'declined', 'quest', 'reward'].includes(state.screen) ? state.screen : 'welcome';
if (resumable === 'online') resumeTimer();
else if (resumable === 'quest') renderMission();
else if (resumable === 'reward') renderReward();
else show(resumable, false);
