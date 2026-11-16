// i load quests.csv with p5 here then each page grabs what it needs from it
// quest details/text come from csv except for media

// NOTE: i used help from my cousin het patel who does CS professionally to teach
// me how to troubleshoot and do some of my code :3

var table;

// all the quests go in here once the csv loads
var quests = [];

// how many quests there are the images and seals use this so they dont need the csv
var total = 5;

// image file names for each quest in quest order (quest 1 first)
var questPics = ['assets/questimage1.png', 'assets/questimage2.png', 'assets/questimage3.png', 'assets/questimage4.png', 'assets/questimage5.png'];
var itemPics = ['assets/sworditem.png', 'assets/acornitem.png', 'assets/horseshoeitem.png', 'assets/toothitem.png', 'assets/featheritem.png'];

// the landing button doesnt need the csv so i run it right away
if (document.body.id == 'landing') {
  setupLanding();
}

function preload() {
  // p5 waits for this to finish before it runs setup so the csv is always ready
  // load the csv... PLEASE STOP BREAKING PLEASE
  table = loadTable('quests.csv', 'csv', 'header');
}

function setup() {
  noCanvas(); // no canvas, i only need p5 for loadTable

  // turn each csv row into an object and push it into the quests list
  
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

  // the csv is ready now so the words can go in
  runText();
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

// the words from the csv this is the only thing that needs it
function runText() {
  var page = document.body.id;

  if (page == 'quest') {
    fillQuestText();
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
  for (var i = 1; i <= total; i++) {
    if (isBroken(i) == false) {
      return i;
    }
  }
  return 0; // 0 = all done
}

// which seal image to use the broken one if its been broken
function sealPic(id) {
  if (isBroken(id)) {
    return 'assets/seal' + id + 'broken.png';
  }
  return 'assets/seal' + id + '.png';
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
  for (var i = 1; i <= total; i++) {
    var cls = 'seal';
    if (isBroken(i)) {
      cls = cls + ' broken';
    } else if (i == next) {
      cls = cls + ' next';
    }
    sealHtml = sealHtml + '<a class="' + cls + '" href="quest.html?id=' + i + '"><img src="' + sealPic(i) + '" alt="seal ' + i + '"></a>';
  }
  document.getElementById('seal-grid').innerHTML = sealHtml;

  // count how many seals are left
  var left = total - broken.length;
  var leftText = left + ' seals remain';
  if (left == 1) {
    leftText = '1 seal remains';
  }
  document.getElementById('seals-left').textContent = leftText;

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

  // todo for final: swap in my real drawn map once i scout the actual locations - need like 6 pngs/svgs

  // map1 shows while quest 1 is next and so on when everything is done it stays on the last map
  var mapNum = next;
  if (mapNum == 0) {
    mapNum = total;
  }
  document.getElementById('map').innerHTML = '<img src="assets/map' + mapNum + '.png" alt="map of the realm, tap to enlarge">';

  // tap the map to see it bigger tap again to close
  var zoom = document.getElementById('map-zoom');
  document.getElementById('map-zoom-img').src = 'assets/map' + mapNum + '.png';
  document.getElementById('map').addEventListener('click', function () {
    zoom.style.display = 'flex';
  });
  zoom.addEventListener('click', function () {
    zoom.style.display = 'none';
  });
}


// quest page

function setupQuest() {
  var id = getIdFromUrl();

  // the pic and button dont need the csv. the title gets its name later
  document.getElementById('quest-title').textContent = 'Quest ' + id;
  document.getElementById('quest-pic').innerHTML = '<img src="' + questPics[id - 1] + '" alt="quest ' + id + '">';

  var btn = document.getElementById('complete-btn');
  if (isBroken(id)) {
    btn.textContent = 'Seal Already Broken';
    btn.className = 'text-button'; // the complete button is a picture so this makes it plain words again
    btn.disabled = true;
  } else {
    btn.addEventListener('click', function () {
      window.location = 'seal.html?id=' + id;
    });
  }
}

// title clue and task come from the csv so they wait for it
function fillQuestText() {
  var q = findQuest(getIdFromUrl());

  document.getElementById('quest-title').textContent = 'Quest ' + q.id + ': ' + q.name;
  document.getElementById('quest-clue').textContent = q.clue;
  document.getElementById('quest-task').innerHTML = '<b>Task:</b> ' + q.task;
}


// seal page
// hold the circle for 2 sec to break the seal 

var sealId = 0;
var sealQuest;
var sealCircle;
var sealImg;
var sealMsg;
var sealItemBox;
var holdTime = 0;
var holdTimer = null;
var sealDone = false;

function setupSeal() {
  sealId = getIdFromUrl();
  sealCircle = document.getElementById('seal-circle');
  sealImg = document.getElementById('seal-img');
  sealImg.src = 'assets/seal' + sealId + '.png';
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
  sealMsg.textContent = 'Holding...';
  holdTimer = setInterval(tickHold, 100);
}

// runs every 100ms while holding
function tickHold() {
  holdTime = holdTime + 100;
  // now the seal grows a little while holding instead
  sealCircle.style.transform = 'scale(' + (1 + holdTime / 10000) + ')';
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
  sealCircle.style.transform = '';
  sealMsg.textContent = 'Hold to break';
}

function finishHold() {
  clearInterval(holdTimer);
  holdTimer = null;
  sealDone = true;
  markBroken(sealId);
  sealMsg.textContent = 'Seal broken!';
  sealImg.src = 'assets/seal' + sealId + 'broken.png';
  sealCircle.style.transform = '';

  // give the item for this quest once the seal breaks
  // the words under it come from the csv the pic shows either way
  sealQuest = findQuest(sealId);
  var desc = '';
  if (sealQuest != undefined) {
    desc = sealQuest.itemDesc;
  }
  sealItemBox.innerHTML = '<div class="item-circle got"><img src="' + itemPics[sealId - 1] + '" alt="item ' + sealId + '"></div><p>' + desc + '</p>';
  sealItemBox.style.visibility = 'visible';

  // back to home after a bit so they have long enough to see the item
  setTimeout(goHome, 2500);
}

function goHome() {
  window.location = 'home.html';
}


// inv page

function setupInventory() {
  var html = '';
  var found = 0;

  for (var i = 0; i < total; i++) {
    // items you havent found yet show up as a dark shadow css does that
    if (isBroken(i + 1)) {
      found = found + 1;
      html = html + '<div class="item-circle got" data-index="' + i + '"><img src="' + itemPics[i] + '" alt="item ' + (i + 1) + '"></div>';
    } else {
      html = html + '<div class="item-circle locked" data-index="' + i + '"><img src="' + itemPics[i] + '" alt="locked item"></div>';
    }
  }

  document.getElementById('item-grid').innerHTML = html;
  document.getElementById('item-count').textContent = found + ' of ' + total + ' items found';
  document.getElementById('item-grid').addEventListener('click', tapItem);
}

// tap an item to read about it
function tapItem(e) {
  var index = e.target.getAttribute('data-index');
  if (index == null) {
    return;
  }
  var id = Number(index) + 1;
  var q = findQuest(id); // the words come from the csv
  var desc = document.getElementById('item-desc');
  if (isBroken(id) == false) {
    desc.textContent = 'Finish quest ' + id + ' to find this item.';
  } else if (q == undefined) {
    desc.textContent = '';
  } else {
    desc.innerHTML = '<b>' + q.item + '</b>: ' + q.itemDesc;
  }
}


// free the prince pagage
// drag every item onto a seal and then touch all the seals at the same time (hold for a sec) and the
// prince is free and then html drag and drop doesnt work on phones so im using pointer events instead

var freeMsg;
var sealBox;
var itemBox;

// where each seal sits in the box (percent) kinda ring-y so one hand can reach them hopefully
var spots = [[50, 18], [82, 42], [70, 80], [30, 80], [18, 42]];

var sealEls = [];
var sealArts = []; // the seal pic inside each seal
var filled = [];   // true once an item is on that seal
var placed = 0;    // how many items are on seals so far

var held = null;   // the item circle being dragged right now
var heldIndex = 0; // which quest that item came from
var startX = 0;
var startY = 0;

var sealHeld = []; // true while a finger is on that seal
// a mouse cant press 5 things at once so clicking toggles 
// saurrrr this is for testing on a laptop
// TOTALLY DIDNT HAVE TO LEARN THE HARD WAY :D
var freeTimer = null;
var freeDone = false;

var pressMsg = 'Now touch all the seals at once with thy fingers.';

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
  for (var i = 0; i < total; i++) {
    var s = document.createElement('div');
    s.className = 'free-seal';
    s.style.left = spots[i][0] + '%';
    s.style.top = spots[i][1] + '%';
    s.setAttribute('data-index', i);
    var art = document.createElement('img');
    art.src = 'assets/seal' + (i + 1) + '.png';
    art.alt = 'seal ' + (i + 1);
    s.appendChild(art);
    sealArts.push(art);
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
  for (var j = 0; j < total; j++) {
    var item = document.createElement('div');
    item.className = 'item-circle got drag';
    item.innerHTML = '<img src="' + itemPics[j] + '" alt="item ' + (j + 1) + '">';
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
    // the item sits on top of the seal pic
    var itemPic = document.createElement('img');
    itemPic.className = 'seal-item';
    itemPic.src = itemPics[heldIndex];
    itemPic.alt = 'item ' + (heldIndex + 1);
    sealEls[hit].appendChild(itemPic);
    sealEls[hit].className = 'free-seal filled';
    held.style.display = 'none';
    placed = placed + 1;

    if (placed == total) {
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
    // a little extra room so its easy to land on with a thumb
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
  if (placed < total) {
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
  if (placed < total) {
    return;
  }
  var index = Number(e.target.getAttribute('data-index'));
  sealHeld[index] = false;
  updatePressed();
}

// checks which seals have a finger or a mouse click on dem right now
function updatePressed() {
  var count = 0;
  for (var k = 0; k < sealEls.length; k++) {
    // pressed seals show the broken pic
    var art = sealArts[k];
    if (sealHeld[k] == true) {
      count = count + 1;
      sealEls[k].className = 'free-seal filled pressed';
      art.src = 'assets/seal' + (k + 1) + 'broken.png';
    } else {
      sealEls[k].className = 'free-seal filled';
      art.src = 'assets/seal' + (k + 1) + '.png';
    }
  }

  if (count == sealEls.length) {
    // all of them at once have to keep holding for a sec
    if (freeTimer == null) {
      freeMsg.textContent = 'Hold...';
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
  freeMsg.textContent = 'The seals shatter!';
  setTimeout(goPrince, 1500);
}

function goPrince() {
  window.location = 'prince.html';
}


// everything except the csv words starts right away
runPage();