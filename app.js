const screens = [...document.querySelectorAll('.screen')];
const $ = id => document.getElementById(id);
const STORAGE_KEY = 'islandTreasuresQuestV4';

const CODE_HASHES = {
  temple: '9de05beff439add983f26430b8ae6846a0247071c0e640e401c297d22d6ff0d1',
  diamond: '6d924f7bddebb3a59fdc05c0e6eab5623c535e3538946a8301ca0fdd7bf61f76',
  booty: '613b11c983201f40b8637cd79c401ab0d2529ba7581ba33bd102653b097c5076'
};

const missions = [
  { eyebrow: 'YOU ARE ALREADY AT THE FIRST STOP', title: 'Ask the Island Treasures cashier', copy: 'You are already at Island Treasures. Ask the cashier for the first Treasure Quest code to unlock your next stop.', destination: 'Island Treasures · cashier', action: 'Ask for code #1', hash: CODE_HASHES.temple, visual: ['stop-one', '★', 'ISLAND TREASURES', 'Temple of Fun'] },
  { eyebrow: 'YOUR NEXT CLUE IS NEARBY', title: 'Continue to Diamonds International', copy: 'Walk back into Diamonds International and ask the team for the second Treasure Quest code.', destination: 'Diamonds International', action: 'Ask for code #2', hash: CODE_HASHES.diamond, visual: ['stop-two', '◆', 'DIAMONDS', 'International'] },
  { eyebrow: 'FINAL STOP · CLAIM YOUR PRIZE', title: 'Take the elevator to Island Booty', copy: 'Inside Diamonds, take the elevator downstairs. At Island Booty, ask for the final code, enter it here and show the completed screen.', destination: 'Island Booty · downstairs', action: 'Final code + prize', hash: CODE_HASHES.booty, visual: ['stop-three', '☀', 'ISLAND BOOTY', 'Caribbean Treasures'] }
];

const blankState = () => ({ screen: 'welcome', questStep: 0, rewardCode: null, claimed: false });
let state = loadState();

function loadState() {
  try { return { ...blankState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return blankState(); }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function show(id, persist = true) {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  const statuses = { welcome: 'Treasure Quest invitation', quest: 'Mission active', reward: 'Reward unlocked' };
  $('questStatus').textContent = statuses[id] || 'Treasure Quest';
  if (persist) { state.screen = id; saveState(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

$('acceptQuest').addEventListener('click', () => {
  if (!$('terms').checked) {
    $('openTerms').focus();
    alert('Please accept the promotion terms to start the Treasure Quest.');
    return;
  }
  state.questStep = 0;
  state.rewardCode = null;
  state.claimed = false;
  saveState();
  renderMission();
});

$('missionForm').addEventListener('submit', async event => {
  event.preventDefault();
  const mission = missions[state.questStep];
  if (!mission || await digest($('missionCode').value) !== mission.hash) {
    $('missionMessage').textContent = 'That is not the code for this stop. Please ask the team and try again.';
    return;
  }
  $('missionMessage').textContent = state.questStep === missions.length - 1 ? 'Correct — treasure found!' : 'Correct — your next destination is unlocked!';
  state.questStep += 1;
  saveState();
  setTimeout(renderMission, 500);
});

$('claimButton').addEventListener('click', () => {
  if (state.claimed) return;
  if (!confirm('Staff confirmation: mark this souvenir as claimed? This cannot be undone on this device.')) return;
  state.claimed = true;
  saveState();
  renderReward();
});

function reset() {
  if (state.screen !== 'welcome' && !confirm('Restart the Treasure Quest and clear the current progress on this device?')) return;
  state = blankState();
  saveState();
  $('terms').checked = false;
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

const resumable = ['welcome', 'quest', 'reward'].includes(state.screen) ? state.screen : 'welcome';
if (resumable === 'quest') renderMission();
else if (resumable === 'reward') renderReward();
else show('welcome', false);
