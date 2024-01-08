var conf = config;
const data_file = conf.data_file;
let userData;
let temp_user;
let archived = {};
var current_round = 0;
var timers = {};
let timerInterval;
var timerDisplay;
let seconds = 0;
var ding = new Audio(conf.sound_effect.path + conf.sound_effect.ding);
var fw = new Audio(conf.sound_effect.path + conf.sound_effect.fireworks);
var is_rolled = false;

var initPage = function (data) {
  const page = `
    <div class="col-8 main-page" id="main-page">
    <h3>${conf.oraginzation} - ${conf.current_year}</h3>
    <h1 class="main-title">${conf.main_page_title}</h1>
    <div class="tab-wrap" id="tab-wrap"></div></div>
    <div class="col-4 left-page" id="champions-list">
    <h3 class="winners-title">${conf.champion_title}</h3>
    <ul class="list-group list-group-flush" id="champions-list-ul"></ul></div></div>
    <span id="wtimer" class="notification-container"></span>
    <div id="nc" class="notification-container"><div class="notification"></div></div>
    <div class="audio-container"><audio id="audioPlayer" preload="auto"><source src="" type="audio/mpeg"></audio>`;
  var elpage = $(`<div class="col-12" id="page-container">`).html(page);
  $("body").prepend(elpage);
};

var loadChampionList = function (data) {
  var screenHeight = window.innerHeight;
  var dynamicDiv = $('#' + data);
  dynamicDiv.css('height', screenHeight + "px");
};

var initStage = function () {
  data = conf.stage_init;
  const parent = document.getElementById("tab-wrap");
  var child_ip = document.createElement("div");
  var child_tab = document.createElement("div");
  ip_items = "";
  tab_items = "";
  if (conf.show_raw_data) {
    show_table = "";
  } else {
    show_table = "none";
  }
  for (var key in data) {
    const check = data[key].checked === true ? " checked" : "";
    const d = data[key].checked === true ? "none" : "none";
    const round = data[key].round;
    ip_items += `<input type="radio" id="tab-${round}" data-round="${round}" name="tabGroup1" class="tab" onclick="setRoundStage(this)"${check}>
        <label class="tab-label" id="tab-label-${round}" for="tab-${round}" style="display:${d};">${data[key].name}</label>`;
    tab_items += `<div class="tab__content" id="tabc-${round}">
          <div class="round-title"><h2 class="">${data[key].name}</h2></div>
          <div id="animate-${round}"></div></div>`;
  }
  child_ip.innerHTML = ip_items;
  while (child_ip.firstChild) {
    parent.appendChild(child_ip.firstChild);
  }
  child_tab.innerHTML = tab_items;
  while (child_tab.firstChild) {
    parent.appendChild(child_tab.firstChild);
  }
  const r = parent.querySelectorAll('input[type="radio"]');
  r.forEach((radio) => {
    if (radio.checked) {
      setRoundStage(radio);
    }
  });
};

var getData = function (data_file) {
  return new Promise((resolve, reject) => {
    fetch(data_file)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        userData = data;
        resolve(userData);
      })
      .catch(function (err) {
        console.log("error: " + err);
        reject(err);
      });
  });
};

var randomUser = function (data) {
  var randomObject;
  if (Array.isArray(data)) {
    randomObject = getRandomObjectFromArray(data);
  } else {
    randomObject = getRandomObjectFromDict(data);
  }
  if (randomObject) {
    return randomObject;
  } else {
    return -1;
  }
};

var getRandomObjectFromArray = function (array) {
  if (Array.isArray(array) && array.length > 0) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  } else {
    return null; // Return null if the array is empty or not an array
  }
};

var getRandomObjectFromDict = function (obj) {
  var keys = Object.keys(obj);
  if (keys.length > 0) {
    var rd = (keys.length * Math.random()) << 0;
    return [keys[rd], obj[keys[rd]]];
  } else {
    return null;
  }
};

var removeUser = function (mid) {
  delete userData[mid];
};

var filterDataByGrp = function (jsonData, grp, ValueToFilter) {
  Object.keys(jsonData)
    .filter((key) => jsonData[key][grp] === ValueToFilter)
    .forEach((key) => {
      console.log('Deleted', grp, jsonData[key]);
      delete jsonData[key];
    });
  return jsonData;
};

var addChampionList = function (r) {
  if (document.getElementById(`champ-${r}`)) {
    return;
  }
  const parent = document.getElementById("champions-list-ul");
  var child = document.createElement("li");
  child.innerHTML = `<li class="list-group-item active champ-list-label">${conf.stage_init[r].name}</li>
    <li class="list-group-item champ-list" id="champ-${r}"></li>`;
  parent.prepend(child);
};

var addChampionBalls = function (r, data) {
  const parent = document.getElementById(`champ-${r}`);
  var child = document.createElement("span");
  child.innerHTML = `<section class="stage">
  <figure class="ball"><span class="shadow"></span><span class="eight">${data}</span></figure>
  <span class="winner-name">${rename(temp_user[1].name)}</span></section>`;
  parent.appendChild(child);
};

var rename = function (params) {
  var arr = params.split(' ');
  return arr.at(arr.length-1) + " " + arr.at(0);
}

var updateBallSize = function (params) {
  $('.slotwrapper').css('--slot-size', params/conf.id_num + "px");
}

var updateArBallSize = function (params, r) {
  $('.stage').css('--ball-size', params/(5*r) + "px");
  $('.stage').css('--ball-font-size', params/(25*r) + "px");
  $('.stage').css('--ball-text-size', params/(29*r) + "px");
}

var initRound = function (round, data) {
  var ele_tk = $(`#animate-${round}`);
  ele_tk.html("");
  var l = conf.stage_init[round].skip;
  var rduser;
  if (l) {
    for (var i = 0; i < l.length; i++) {
      data = filterDataByGrp(data, "priority", l[i]);
    }
  }
  rduser = randomUser(data);
  temp_user = rduser;
  const elslot = $(`<div class="slotwrapper col-12" id="slotspiner-${round}">`);
  for (let i = 0; i < conf.id_num; i++) {
    var eul = $(`<ul data-slot="${i}" class="col-${12/conf.id_num}">`);
    for (let j = 0; j < 10; j++) {
      eul.append($(`<li class="col-12" data-value="${j}">`).html(j));
    }
    elslot.append(eul);
  }
  var p = $(`<div class="col-12">`);
  p.append(elslot);
  p.append($(`<h3 id="winner-${round}">&nbsp;</h3>`));
  ele_tk.append(p);
  var n_btn = `<div class="col-12 btn-grp">
  <button type="button" class="btn btn-outline-danger btn-lg btn-block btn-roll offset-3 col-6" id="rollBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" onclick="startRoller(this)">${conf.action_btn.start}</button>
  <button type="button" class="btn btn-outline-warning btn-lg btn-block btn-add col-6" id="addBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" onclick="addRoller(this)" style="display:none;" disabled>${conf.action_btn.add}</button>
  <button type="button" class="btn btn-outline-success btn-lg btn-block btn-ok col-6" id="okBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" data-round="${round}" onclick="okRoller(this)" style="display:none;" disabled>${conf.action_btn.accept}</button></div>`;
  var e_btn = $("<div>").html(n_btn);
  ele_tk.append(e_btn);
  updateBallSize(ele_tk.width());
  updateArBallSize($('#champions-list').width(), 1);
  removeUser(rduser[0]);
};

var isMaxPrize = function (round) {
  max_prize = conf.stage_init[round].max;
  if (archived[round].length >= max_prize) {
    return true;
  } else {
    return false;
  }
};

var startRoller = function (data) {
  current_roll = data.getAttribute("data-id");
  let stringArray = current_roll.split('');
  let numberArray = stringArray.map(Number)
  var winner = $(`#winner-${current_round}`);
  var btnAdd = $(`#addBtn-${current_round}-${current_roll}`);
  var btnOk = $(`#okBtn-${current_round}-${current_roll}`);

  data.style.display = "none";
  data.disabled = true;
  if (conf.show_timer) {
    stopTimer();
    startTimer();
  }
  var sound = new Audio(conf.sound_effect.path + conf.sound_effect.rolling[
    Math.floor(Math.random() * conf.sound_effect.rolling.length)
  ]);
  // Loop of playing sound
  sound.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);
  $(`#slotspiner-${current_round} ul`).css('width', 100/numberArray.length + '%' );
  sound.play(); // Start play the sound after click button
  var t = conf.test_mode ? 1 : conf.roller.time;
  $(`#slotspiner-${current_round} ul`).playSpin({
      time: t,
      endNum: numberArray,
      stopSeq: conf.roller.stopSeq[
        Math.floor(Math.random() * conf.roller.stopSeq.length)
      ],
      easing: conf.roller.easing[
        Math.floor(Math.random() * conf.roller.easing.length)
      ],
      loop: conf.roller.loops,
      manualStop: conf.roller.manualStop,
      useStopTime: conf.roller.useStopTime,
      stopTime: conf.roller.stopTime,
      onEnd: function() {
          ding.play(); // Play ding after each number is stopped
      },
      onFinish: function() {
          sound.pause(); // To stop the looping sound is pause it
          btnAdd.css('display', "").attr('disabled', false);
          btnOk.css('display', "").attr('disabled', false);
          winner.text(temp_user[1]["name"]);
          playFireWorks(true);
      }
  });
};

var okRoller = function (data) {
  current_roll = data.getAttribute("data-id");
  round = data.getAttribute("data-round");
  rduser = temp_user;
  if (conf.test_mode || conf.show_archived) {
    addChampionList(round);
    addChampionBalls(round, rduser[0]);
  }
  if (conf.remove_team_in_rounds.indexOf(parseInt(round)) !== -1) {
    userData = filterDataByGrp(userData, "team", rduser[1]["team"]);
  }
  if (rduser[1]['subteam']) {
    userData = filterDataByGrp(userData, "subteam", rduser[1]["subteam"]);
  }
  archived[round].push(rduser[0]);
  console.log(archived);
  data.disabled = true;
  document.getElementById(`addBtn-${round}-${rduser[0]}`).click();
  playFireWorks(false);
};

var addRoller = function (data) {
  current_roll = data.getAttribute("data-id");
  if (isMaxPrize(current_round) === false) {
    playSound(conf.sound_effect.approve, false);
    initRound(current_round, userData);
  } else {
    showNotification("Next Round");
    var next_round = round - 1;
    if (next_round > 0) {
      document.getElementById(`tab-${next_round}`).click();
      playSound(conf.sound_effect.end_round, false);
    } else {
      endGame();
    }
  }
  data.disabled = true;
  playFireWorks(false);
};

var setRoundStage = function (data) {
  current_round = data.getAttribute("data-round");
  archived[current_round] = [];
  initRound(current_round, userData);
};

var playFireWorks = function (data, p) {
  if (conf.test_mode || conf.fire_works) {
    var page = "body";
    if (p) {
      page = p;
    }
    const container = $(page);
    if (data === true) {
      fw.play();
      container.fireworks();
    } else {
      fw.pause();
      container.fireworks("destroy");
    }
  }
};

var endGame = function (params) {
  playFireWorks(false);
  playFireWorks(true, "#champions-list");
  var page = $("#main-page");
  page.addClass("fade-out");
  setTimeout(function () {
    page.css('display', 'none');
    $("#champions-list").removeClass("col-4").addClass("col-12");
    $("#champions-list-ul").addClass("offset-2 col-8");
    playSound(conf.sound_effect.end_game, true);
    updateArBallSize($('#champions-list').width(), 3.1);
    fw.play();
  }, 3000);
};

var playSound = function (fileName, loop) {
  if (conf.test_mode || conf.play_sound) {
    var audio = document.getElementById("audioPlayer");
    if (loop === true) {
      audio.loop = true;
    } else {
      audio.loop = false;
    }
    console.log(fileName)
    audio.src = conf.sound_effect.path + fileName; // Set the source of the audio element
    audio.play();
  }
};

var initTimer = function (params) {
  timerDisplay = $('#wtimer');
}

var updateTimer = function () {
    seconds++;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    var data = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    console.log(data);
    timerDisplay.textContent = data;
}

var startTimer = function () {
  if (!timerInterval) {
      timerInterval = setInterval(updateTimer, 1000);
      console.log(timerInterval)
  }
}

var stopTimer = function() {
    clearInterval(timerInterval);
    timerInterval = null;
    seconds = 0;
}

var showNotification = function (data) {
  const notification = document.querySelector("#nc");
  notification.querySelector(".notification").textContent = data;
  notification.style.display = "block"; // Set the display property to 'block'
  setTimeout(hideNotification, 5000);
};

// Function to hide the notification
var hideNotification = function (data) {
  const notification = document.querySelector("#nc");
  notification.style.display = "none"; // Set the display property to 'none'
};

var keypressHandler = function (params) {
  $(document).keypress(function(event) {
    console.log(temp_user[0], archived, $.type(archived), event.keyCode);
    if (archived[current_round].indexOf(temp_user[0]) === -1) {
      if (is_rolled===false && (event.which === 32 || event.keyCode === 32)) {
        $(`#rollBtn-${current_round}-${temp_user[0]}`).trigger('click');
        is_rolled = true;
      } else if (is_rolled===true && (event.which === 92 || event.keyCode === 92)) {
        console.log(event.keyCode)
        $(`#addBtn-${current_round}-${temp_user[0]}`).trigger('click');
        playSound(conf.sound_effect.reject, false);
        is_rolled=false;
      } else if (is_rolled===true && (event.which === 13 || event.keyCode === 13)) {
        $(`#okBtn-${current_round}-${temp_user[0]}`).trigger('click');
        is_rolled=false;
      }
    }
  });
}

var init = function () {
  getData(data_file)
    .then(() => {
      initStage();
    })
    .catch((error) => {
      // Handle errors if getData() fails
      console.error("Error while getting data:", error);
    });
  document.title = `${conf.app_name} ${conf.current_year}`;
  initPage();
  loadChampionList("page-container");
  keypressHandler();
  initTimer();
};

window.onload = function () {
  init();
};
