// knightquest script.js
// i load quests.csv with p5 here then each page grabs what it needs from it

var table;

// all the quests go in here once the csv loads
var quests = [];

// the landing button doesnt need the csv so i run it right away
if (document.body.id == 'landing') {
  setupLanding();
}

function preload() {
  // p5 waits for this to finish before it runs setup, so the csv is always ready
  // load the csv... PLEASE STOP BREAKING PLEASE
  table = loadTable('quests.csv', 'csv', 'header');
}

function setup() {
  noCanvas(); // no canvas, i only need p5 for loadTable

  // turn each csv row into an object and push it into the quests list
  // todo: lat and lng are all tbd so im not using them yet. fill them in after i scout the spots and take act pics
  for (var i = 0; i < table.getRowCount(); i++) {
    var q = {
      id: table.getNum(i, 'id'),
      name: table.getString(i, 'name'),
      place: table.getString(i, 'place'),
      clue: table.getString(i, 'clue'),
      task: table.getString(i, 'task'),
      item: table.getString(i, 'item'),
      itemDesc: table.getString(i, 'item_desc')
    };
    quests.push(q);
  }

  runPage();
}

function runPage() {
  // every html page has an id on the body so i know which page im on
  var page = document.body.id;

  if (page == 'home') {
    setupHome();
  }
  if (page == 'quest') {
    setupQuest();
  }
  if (page == 'seal') {
    setupSeal();
  }
  if (page == 'inventory') {
    setupInventory();
  }
  if (page == 'free') {
    setupFree();
  }
}


// progress stuffaaffas
// i'm saving broken seals in localStorage as a string like "1,2"

function getBroken() {
  var saved = localStorage.getItem('broken');
  if (saved == null) {
    return [];
  }
  if (saved == '') {
    return [];
  }
  var parts = saved.split(',');
  var nums = [];
  for (var i = 0; i < parts.length; i++) {
    nums.push(Number(parts[i]));
  }
  return nums;
}

function isBroken(id) {
  var broken = getBroken();
  if (broken.indexOf(id) == -1) {
    return false;
  } else {
    return true;
  }
}

function markBroken(id) {
  var broken = getBroken();
  if (broken.indexOf(id) == -1) {
    broken.push(id);
    localStorage.setItem('broken', broken.join(','));
  }
}

// next seal the first one i havent broken yet
function findNext() {
  for (var i = 0; i < quests.length; i++) {
    if (isBroken(quests[i].id) == false) {
      return quests[i].id;
    }
  }
  return 0; // 0 = all done
}

function findQuest(id) {
  for (var i = 0; i < quests.length; i++) {
    if (quests[i].id == id) {
      return quests[i];
    }
  }
}

// grabs the ?id=3 part of the url
function getIdFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var id = Number(params.get('id'));
  if (id == 0) {
    id = 1;
  }
  return id;
}


// title page

function setupLanding() {
  var btn = document.getElementById('start-btn');
  btn.addEventListener('click', function () {
    localStorage.setItem('broken', ''); // new game, wipe the old seals
    window.location = 'raven.html';
  });
}


// home and nav

function setupHome() {
  var next = findNext();
  var broken = getBroken();

  // make a circle for each seal
  var sealHtml = '';
  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    var cls = 'seal';
    if (isBroken(q.id)) {
      cls = cls + ' broken';
    } else if (q.id == next) {
      cls = cls + ' next';
    }
    sealHtml = sealHtml + '<a class="' + cls + '" href="quest.html?id=' + q.id + '">' + q.id + '</a>';
  }
  document.getElementById('seal-grid').innerHTML = sealHtml;

  // count how many seals are left
  var left = quests.length - broken.length;
  document.getElementById('seals-left').textContent = left + ' seals remain';

  // free the prince stays greyed out until all the seals are broken
  var freeBtn = document.getElementById('free-btn');
  if (left == 0) {
    freeBtn.disabled = false;
    freeBtn.addEventListener('click', function () {
      window.location = 'free.html';
    });
  } else {
    freeBtn.disabled = true;
  }

  // placeholder map, its just an empty box in home.html for now
  // todo for final: swap in my real drawn map once i scout the actual locations - need like 6 pngs/svgs
}


// quest page

function setupQuest() {
  var id = getIdFromUrl();
  var q = findQuest(id);

  document.getElementById('quest-title').textContent = 'quest ' + q.id + ': ' + q.name;
  document.getElementById('quest-pic').textContent = 'pic of ' + q.place;
  document.getElementById('quest-clue').textContent = q.clue;
  document.getElementById('quest-task').textContent = 'task: ' + q.task;

  var btn = document.getElementById('complete-btn');
  if (isBroken(q.id)) {
    btn.textContent = 'seal already broken';
    btn.disabled = true;
  } else {
    btn.addEventListener('click', function () {
      window.location = 'seal.html?id=' + q.id;
    });
  }
}


// seal page
// hold the circle for 2 sec to break the seal needa figure out how ill do this with drawins

var sealId = 0;
var sealQuest;
var sealCircle;
var sealMsg;
var sealItemBox;
var holdTime = 0;
var holdTimer = null;
var sealDone = false;

function setupSeal() {
  sealId = getIdFromUrl();
  sealQuest = findQuest(sealId);
  sealCircle = document.getElementById('seal-circle');
  sealMsg = document.getElementById('seal-msg');
  sealItemBox = document.getElementById('item-box');

  // pointer events cover both mouse and touch hehhehe
  sealCircle.addEventListener('pointerdown', startHold);
  sealCircle.addEventListener('pointerup', stopHold);
  sealCircle.addEventListener('pointerleave', stopHold);
  sealCircle.addEventListener('pointercancel', stopHold);
}

function startHold() {
  if (sealDone == true) {
    return;
  }
  if (holdTimer != null) {
    return;
  }
  sealMsg.textContent = 'holding...';
  holdTimer = setInterval(tickHold, 100);
}

// runs every 100ms while holding
function tickHold() {
  holdTime = holdTime + 100;
  // border gets thicker while holding so it looks like something is happening bc i couldnt tell whooops
  sealCircle.style.borderWidth = (3 + holdTime / 100) + 'px';
  if (holdTime >= 2000) {
    finishHold();
  }
}

function stopHold() {
  if (sealDone == true) {
    return;
  }
  if (holdTimer == null) {
    return;
  }
  clearInterval(holdTimer);
  holdTimer = null;
  holdTime = 0;
  sealCircle.style.borderWidth = '3px';
  sealMsg.textContent = 'hold to break';
}

function finishHold() {
  clearInterval(holdTimer);
  holdTimer = null;
  sealDone = true;
  markBroken(sealId);
  sealMsg.textContent = 'seal broken!';
  sealCircle.style.background = 'black';
  sealCircle.style.color = 'white';

  // give the item for this quest once the seal breaks
  sealItemBox.innerHTML = '<div class="item-circle got">' + sealQuest.item + '</div><p>(my illustrations of ' + sealQuest.item + ' will go here hehehe)</p><p>' + sealQuest.itemDesc + '</p>';
  sealItemBox.style.display = 'block';

  // back to home after a bit so they have long enough to see the item
  setTimeout(goHome, 2500);
}

function goHome() {
  window.location = 'home.html';
}


// inv page

function setupInventory() {
  var html = '';

  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    if (isBroken(q.id)) {
      html = html + '<div class="item-circle got">' + q.item + '</div>';
    } else {
      html = html + '<div class="item-circle">?</div>';
    }
  }

  document.getElementById('item-grid').innerHTML = html;
}


// free the prince pagage
// drag every item onto a seal and then touch all the seals at the same time (hold for a sec) and the
// prince is free and then html drag and drop doesnt work on phones so im using pointer events instead
// todo for final: swap the item names on the seals for my drawn items

var freeMsg;
var sealBox;
var itemBox;

// where each seal sits in the box (percent) kinda ring-y so one hand can reach them hopefully
var spots = [[50, 18], [82, 42], [70, 80], [30, 80], [18, 42]];

var sealEls = [];
var filled = [];   // true once an item is on that seal
var placed = 0;    // how many items are on seals so far

var held = null;   // the item circle being dragged right now
var heldIndex = 0; // which quest that item came from
var startX = 0;
var startY = 0;

var sealHeld = []; // true while a finger is on that seal
// a mouse cant press 5 things at once so clicking toggles saurrrr this is for testing on a laptop
// TOTALLY DIDNT HAVE TO LEARN THE HARD WAY :D
var freeTimer = null;
var freeDone = false;

var pressMsg = 'now touch all the seals at once with thy fingers';

function setupFree() {
  // cant be here until every seal is broken
  if (findNext() != 0) {
    window.location = 'home.html';
    return;
  }

  freeMsg = document.getElementById('free-msg');
  sealBox = document.getElementById('free-seals');
  itemBox = document.getElementById('free-items');

  // make the seals
  for (var i = 0; i < quests.length; i++) {
    var s = document.createElement('div');
    s.className = 'free-seal';
    s.style.left = spots[i][0] + '%';
    s.style.top = spots[i][1] + '%';
    s.setAttribute('data-index', i);
    s.addEventListener('pointerdown', pressSeal);
    s.addEventListener('pointerup', releaseSeal);
    s.addEventListener('pointercancel', releaseSeal);
    s.addEventListener('contextmenu', noMenu);
    sealBox.appendChild(s);
    sealEls.push(s);
    filled.push(false);
    sealHeld.push(false);
  }

  // make the items
  for (var j = 0; j < quests.length; j++) {
    var item = document.createElement('div');
    item.className = 'item-circle got drag';
    item.textContent = quests[j].item;
    item.setAttribute('data-index', j);
    item.addEventListener('pointerdown', grabItem);
    item.addEventListener('contextmenu', noMenu);
    itemBox.appendChild(item);
  }

  // on the whole page so dragging still works if someones just weirdly fast
  document.addEventListener('pointermove', dragItem);
  document.addEventListener('pointerup', dropItem);
  document.addEventListener('pointercancel', dropItem);
}

function noMenu(e) {
  e.preventDefault(); // stops the long press menu on phones that my sister said would be bad
}


// dragging stuff

function grabItem(e) {
  held = e.target;
  heldIndex = Number(held.getAttribute('data-index'));
  startX = e.clientX;
  startY = e.clientY;
  held.style.zIndex = 10;
}

function dragItem(e) {
  if (held == null) {
    return;
  }
  var moveX = e.clientX - startX;
  var moveY = e.clientY - startY;
  held.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
}

function dropItem(e) {
  if (held == null) {
    return;
  }

  var hit = findSealAt(e.clientX, e.clientY);
  if (hit == -1) {
    // missed/put it back
    held.style.transform = '';
    held.style.zIndex = '';
  } else {
    filled[hit] = true;
    sealEls[hit].textContent = quests[heldIndex].item;
    sealEls[hit].className = 'free-seal filled';
    held.style.display = 'none';
    placed = placed + 1;

    if (placed == quests.length) {
      freeMsg.textContent = pressMsg;
    }
  }
  held = null;
}

// checkin which empty seal is this point on -1 if none
function findSealAt(x, y) {
  for (var k = 0; k < sealEls.length; k++) {
    if (filled[k]) {
      continue;
    }
    var box = sealEls[k].getBoundingClientRect();
    // a little extra room (10) so its easy to land on with a thumb
    if (x > box.left - 10) {
      if (x < box.right + 10) {
        if (y > box.top - 10) {
          if (y < box.bottom + 10) {
            return k;
          }
        }
      }
    }
  }
  return -1;
}


// press the seals

function pressSeal(e) {
  // seals only work after all the items are on
  if (placed < quests.length) {
    return;
  }
  if (freeDone == true) {
    return;
  }
  var index = Number(e.target.getAttribute('data-index'));
  if (e.pointerType == 'mouse') {
    if (sealHeld[index] == true) {
      sealHeld[index] = false;
    } else {
      sealHeld[index] = true;
    }
  } else {
    sealHeld[index] = true;
  }
  updatePressed();
}

// finger comes off
function releaseSeal(e) {
  if (e.pointerType == 'mouse') {
    return;
  }
  if (placed < quests.length) {
    return;
  }
  var index = Number(e.target.getAttribute('data-index'));
  sealHeld[index] = false;
  updatePressed();
}

// checks which seals have a finger or a mouse click on them right now
function updatePressed() {
  var count = 0;
  for (var k = 0; k < sealEls.length; k++) {
    if (sealHeld[k] == true) {
      count = count + 1;
      sealEls[k].className = 'free-seal filled pressed';
    } else {
      sealEls[k].className = 'free-seal filled';
    }
  }

  if (count == sealEls.length) {
    // all of them at once have to keep holding for a sec
    if (freeTimer == null) {
      freeMsg.textContent = 'hold...';
      freeTimer = setTimeout(freePrince, 1000);
    }
  } else if (freeTimer != null) {
    clearTimeout(freeTimer);
    freeTimer = null;
    freeMsg.textContent = pressMsg;
  }
}

function freePrince() {
  freeDone = true;
  freeMsg.textContent = 'the seals shatter!';
  setTimeout(goPrince, 1500);
}

function goPrince() {
  window.location = 'prince.html';
}