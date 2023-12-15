const data_file = "data.json";
let userData;
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
    1500,
    { autostart: false }
  );
  timers[val] = timer;
  console.log(timers)
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
  for (var key in data) {
    const val = data[key].prizes_num;
    const round = data[key].round;
    ip_items += `<input type="radio" id="tab-${round}" data-round="${round}" name="tabGroup1" class="tab" onclick="setRoundStage(this)">
        <label for="tab-${round}">${data[key].name}</label>`;
    tab_items += `<div class="tab__content" id="tabc-${round}">
          <h3>${data[key].name}</h3>
          <div id="ticker-${round}"></div>
          <table id="randomData-${round}"><tr><th>ID</th><th>Team</th><th>Prio</th><th>Name</th><th>Status</th></tr></table>
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
};

var getData = function (data_file) {
  fetch(data_file)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      userData = data;
      //   console.log("userData: ", Object.keys(userData).length, userData);
    })
    .catch(function (err) {
      console.log("error: " + err);
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
  var ele_tk = document.getElementById(`ticker-${round}`);
  var ele_table = document.getElementById(`randomData-${round}`);
  ele_tk.innerHTML = '';
  ele_table.style.display = "none";
  var timer = (5 - round) * 1000;
  var rduser = randomUser(data);
  console.log("randomUser: ", rduser);
  if (conf.animation) {
    var n_elem = document.createElement("div");
    var tickerc = `<div id="t-${round}" class="tick" data-value="000" data-did-init="handleTickInit" data-change="${rduser[0]}">
            <div data-repeat="true" data-layout="horizontal fit" data-transform="arrive(9, .00001) -> round -> pad(\'000\') -> split -> delay(rtl,${timer},${timer})">
            <span data-view="flip"></span></div></div>
            <div><button type="button" class="btn btn-success btn-lg btn-block btn-roll" id="rollBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" onclick="startRoller(this)">Roll</button>
            <button type="button" class="btn btn-primary btn-lg btn-block btn-add" id="addBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" onclick="addRoller(this)" style="display:none;"> + </button>
            <button type="button" class="btn btn-danger btn-lg btn-block btn-remove" id="removeBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" onclick="removeRoller(this)" style="display:none;"> X </button></div>`;
    n_elem.innerHTML = tickerc;
    ele_tk.appendChild(Tick.DOM.create(n_elem, { value: 0 }).root);
    Tick.DOM.parse(n_elem);
  }
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
  removeUser(rduser[0]);
  if (conf.remove_team_in_rounds.indexOf(round) !== -1) {
    data = filterDataByGrp(data, "team", rduser[1]["team"]);
  }
  archived[round].push(rduser[0]);
  console.log(archived);
  ele_table.style.display = "";
};

var startRoller = function (data) {
    current_roll = data.getAttribute("data-id");
    timers[current_roll].start();
    var btnAdd = document.getElementById(`addBtn-${current_round}-${current_roll}`);
    var btnRemove = document.getElementById(`removeBtn-${current_round}-${current_roll}`);
    console.log(data, btnAdd, btnRemove)
    data.style.display = 'none';
    btnAdd.style.display = '';
    btnRemove.style.display = '';
}

var addRoller = function (data) {
    current_roll = data.getAttribute("data-id");
    initRound(current_round, userData);
}

var removeRoller = function (data) {
    current_roll = data.getAttribute("data-id");
    timers[current_roll].start();
}

var setRoundStage = function (tab) {
  current_round = tab.getAttribute("data-round");
  archived[current_round] = [];
  initRound(current_round, userData);
  //   initButtons();
};

var initButtons = function () {
  const buttonr = document.getElementById(`randomBtnR${current_round}`);
  buttonr.addEventListener("click", function () {
    callRound("R", current_round, userData);
    userData = filterDataByGrp(userData, "priority", current_round);
    buttonr.style.display = "none";
  });
};

var init = function () {
  loadChampionList("champions-list");
  getData(data_file);
  initStage();
};

window.onload = function () {
  init();
};
