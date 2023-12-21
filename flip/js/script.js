const data_file = "data.json";
let userData;
let temp_user;
let archived = {};
var current_round = 0;
var conf = config;
var timers = {};

var handleTickInit = function (tick) {
  var val = tick._viewDefinition.root.attributes["data-change"].value;
  var timer = Tick.helper.interval(
    function (passed) {
      tick.value = val;
    },
    2000,
    { autostart: false }
  );
  timers[val] = timer;
  console.log(timers);
  //   timer.start();
};

var loadChampionList = function (data) {
  var screenHeight = window.innerHeight;
  var dynamicDiv = document.getElementById(data);
  dynamicDiv.style.height = screenHeight + "px";
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
          <h1>${data[key].name}</h1>
          <div id="ticker-${round}"></div>
          <table id="randomData-${round}" style="display:${show_table};"><tr><th>ID</th><th>Team</th><th>Prio</th><th>Name</th><th>Status</th></tr></table>
        </div>`;
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
        //   console.log("userData: ", Object.keys(userData).length, userData);
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
  console.log("randomUser: ", randomObject, data);
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
    console.log("getRandomObjectFromDict: ", rd, obj);
    return [keys[rd], obj[keys[rd]]];
  } else {
    return null;
  }
};

var removeUser = function (mid) {
  console.log("removeUser: ", mid);
  delete userData[mid];
};

var filterDataByGrp = function (jsonData, grp, ValueToFilter) {
  return Object.keys(jsonData)
    .filter((key) => jsonData[key][grp] === ValueToFilter)
    .reduce((key) => {
      delete jsonData[key];
      console.log("filterDataByGrp: ", jsonData, grp, ValueToFilter, key);
      return jsonData;
    }, {});
};

var addChampionList = function (r) {
  if (document.getElementById(`champ-${r}`)) {
    return;
  }
  const parent = document.getElementById("champions-list-ul");
  var child = document.createElement("li");
  child.innerHTML = `<li class="list-group-item active champ-list-label">Round ${r}</li>
    <li class="list-group-item champ-list" id="champ-${r}"></li>`;
  parent.appendChild(child);
};

var addChampionBalls = function (r, data) {
  const parent = document.getElementById(`champ-${r}`);
  var child = document.createElement("span");
  child.innerHTML = `<span class="badge badge-primary">${data}</span>`;
  parent.appendChild(child);
};

var initRound = function (round, data) {
  console.log(round);
  console.log(data);
  var ele_tk = document.getElementById(`ticker-${round}`);
  ele_tk.innerHTML = "";
  //   var timer = (5 - round) * 1000;
  var timer_1 = (3 - round) * 1000;
  var timer_2 = (4 - round) * 1000;
  var rduser = randomUser(data);
  temp_user = rduser;
  console.log("randomUser: ", rduser);
  if (conf.animation) {
    var n_elem = document.createElement("div");
    var tickerc = `<div id="t-${round}" class="tick col-12" data-value="000" data-did-init="handleTickInit" data-change="${rduser[0]}">
            <div data-repeat="true" data-layout="horizontal fit" data-transform="arrive(9, .00001) -> round -> pad(\'000\') -> split -> delay(rtl,${timer_1},${timer_2})">
            <span data-view="flip"></span></div></div>
            <div class="col-12">
            <button type="button" class="btn btn-outline-success btn-lg btn-block btn-roll col-12" id="rollBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" onclick="startRoller(this)">${conf.action_btn.start}</button>
            <button type="button" class="btn btn-outline-warning btn-lg btn-block btn-add col-6" id="addBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" onclick="addRoller(this)" style="display:none;">${conf.action_btn.add}</button>
            <button type="button" class="btn btn-outline-success btn-lg btn-block btn-ok col-6" id="okBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" data-round="${round}" onclick="okRoller(this)" style="display:none;">${conf.action_btn.accept}</button></div>`;
    n_elem.innerHTML = tickerc;
    ele_tk.appendChild(Tick.DOM.create(n_elem, { value: 0 }).root);
    Tick.DOM.parse(n_elem);
  }
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
  timers[current_roll].start();
  var btnAdd = document.getElementById(
    `addBtn-${current_round}-${current_roll}`
  );
  var btnRemove = document.getElementById(
    `removeBtn-${current_round}-${current_roll}`
  );
  var btnOk = document.getElementById(`okBtn-${current_round}-${current_roll}`);
  console.log(data, btnAdd, btnRemove);
  data.style.display = "none";
  btnAdd.style.display = "";
  btnOk.style.display = "";
  playFireWorks(true);
};

var okRoller = function (data) {
  current_roll = data.getAttribute("data-id");
  round = data.getAttribute("data-round");
  rduser = temp_user;
  console.log(rduser);
  var ele_table = document.getElementById(`randomData-${round}`);
  if (conf.show_raw_data) {
    const new_elem = document.createElement("tr");
    new_elem.innerHTML = `<td>${rduser[0]}</td><td>${rduser[1]["team"]}</td>
                          <td>${rduser[1]["priority"]}</td><td>${rduser[1]["name"]}</td>
                          <td>pending</td>`;
    ele_table.appendChild(new_elem);
  }
  if (conf.show_archived) {
    addChampionList(round);
    addChampionBalls(round, rduser[0]);
  }
  if (conf.remove_team_in_rounds.indexOf(round) !== -1) {
    data = filterDataByGrp(data, "team", rduser[1]["team"]);
  }
  archived[round].push(rduser[0]);
  data.disabled = true;
  console.log(archived);
  document.getElementById(`addBtn-${round}-${rduser[0]}`).click();
};

var addRoller = function (data) {
  current_roll = data.getAttribute("data-id");
  if (isMaxPrize(current_round) === false) {
    initRound(current_round, userData);
  } else {
    showNotification(
      `Reached the Maximum ${conf.stage_init[current_round].max} prizes of round ${current_round}`
    );
    var next_round = round - 1;
    if ( next_round > 0) {
        document.getElementById(`tab-${next_round}`).click();
    } else {
        endGame();
    }
  }
  data.disabled = true;
};

var setRoundStage = function (data) {
  current_round = data.getAttribute("data-round");
  archived[current_round] = [];
  initRound(current_round, userData);
};

var playFireWorks = function (data) {
  const page = "#main-page";
  const container = $(page);
  if (data === true) {
    container.fireworks();
  } else {
    container.fireworks("destroy");
  }
};

var endGame = function (params) {
    playFireWorks(false);
    document.getElementById('main-page').classList.add('fade-out');
    const cl = document.getElementById('champions-list');
    setTimeout(function(){
        document.getElementById('main-page').style.display = "none";
        cl.classList.remove('col-4');
        cl.classList.add('col-12');
    },3000);
}

var showNotification = function (data) {
  const notification = document.querySelector(".notification-container");
  notification.querySelector('.notification').textContent = data;
  notification.style.display = "block"; // Set the display property to 'block'
  setTimeout(hideNotification, 5000);
};

// Function to hide the notification
var hideNotification = function (data) {
  const notification = document.querySelector(".notification-container");
  notification.style.display = "none"; // Set the display property to 'none'
};

var init = function () {
  loadChampionList("page-container");
  getData(data_file)
    .then(() => {
      initStage();
    })
    .catch((error) => {
      // Handle errors if getData() fails
      console.error("Error while getting data:", error);
    });
};

window.onload = function () {
  init();
};
