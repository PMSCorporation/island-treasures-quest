const missions = [
  { eyebrow:"YOUR FIRST STOP", title:"The first hidden location", description:"Tomorrow, this card will show the first real business, its landmark photo and the shortest walking directions.", code:"MAYA" },
  { eyebrow:"SECRET FOUND · NEXT STOP", title:"Follow the tropical clue", description:"The first word was correct. A new location is now unlocked—look for the second participating business.", code:"COZUMEL" },
  { eyebrow:"FINAL STOP", title:"One last secret remains", description:"Reach the third location, find its secret word and unlock your Island Treasures reward.", code:"TREASURE" }
];
let step = Number(localStorage.getItem("itQuestStep") || 0);
const $ = id => document.getElementById(id);
const welcome = $("welcome"), quest = $("quest"), complete = $("complete");

function show(target) {
  [welcome,quest,complete].forEach(el=>el.classList.add("hidden"));
  target.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderMission() {
  if (step >= missions.length) return show(complete);
  const m = missions[step];
  $("missionNumber").textContent = String(step+1).padStart(2,"0");
  $("missionEyebrow").textContent = m.eyebrow;
  $("missionTitle").textContent = m.title;
  $("missionDescription").textContent = m.description;
  $("progressLabel").textContent = `STOP ${step+1} OF ${missions.length}`;
  $("progressPercent").textContent = `${Math.round(step/missions.length*100)}%`;
  $("progressBar").style.width = `${step/missions.length*100}%`;
  $("hint").innerHTML = `Demo code: <strong>${m.code}</strong>`;
  $("secretCode").value = "";
  $("message").textContent = "";
  show(quest);
}
$("startButton").addEventListener("click",()=>{ step=0; localStorage.setItem("itQuestStep",step); renderMission(); });
$("codeForm").addEventListener("submit",event=>{
  event.preventDefault();
  const entered=$("secretCode").value.trim().toUpperCase();
  if (entered !== missions[step].code) { $("message").textContent="That word does not open this lock. Try again."; return; }
  $("message").textContent="Correct! Your next destination is unlocked.";
  setTimeout(()=>{ step++; localStorage.setItem("itQuestStep",step); renderMission(); },700);
});
function reset(){ step=0; localStorage.removeItem("itQuestStep"); show(welcome); }
$("resetButton").addEventListener("click",reset);
$("againButton").addEventListener("click",reset);
if (step>0) renderMission();
