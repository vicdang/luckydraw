
function handleTickInit(tick) {
    var timer = Tick.helper.interval(
        function (passed) {
            tick.value = tick._viewDefinition.root.attributes['data-change'].value;
        }, 1500, { autostart: false }
    );
    timer.start();
    // timer.reset();
}

const data_file = 'data.json';
let userData;
let archived = {};
var conf = config;

var stageInit = function (){
    data = conf.stage_init;
    const parent = document.getElementById('tab-wrap');
    for (var key in data) {
        var val = data[key].prizes_num;
        var child_ip = document.createElement('div');
        var child_tab = document.createElement('div');
        child_ip.innerHTML = `<input type="radio" id="tab${key}" name="tabGroup1" class="tab">
        <label for="tab${key}">Round ${key}</label>`;
        child_tab.innerHTML = `<div class="tab__content">
          <h2>Round ${key}</h2>
          <div id="tickerR${key}"></div>
          <div class="input-group mb-3">
            <input id="roundR${key}" type="number" value="${val}" class="form-control" placeholder="Number of prizes" aria-label="Number of prizes" aria-describedby="basic-addon${key}" disabled>
            <div class="input-group-append">
              <button type="button" class="btn btn-outline-secondary" id="randomBtnR${key}">${data[key].btn_text}</button>
            </div>
          </div>
          <table id="randomDataR${key}"></table>
        </div>`;
        while (child_ip.firstChild){
            parent.appendChild(child_ip.firstChild);
        }
        parent.appendChild(child_tab.firstChild);
    }
}

var getData = function (data_file) {
    fetch(data_file)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            userData = data;
            console.log('userData: ', Object.keys(userData).length, userData)
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });
}

var randomUser = function (data) {
    var randomObject;
    if (Array.isArray(data)) {
        randomObject = getRandomObjectFromArray(data);
    } else {
        randomObject = getRandomObjectFromDict(data);
    }
    console.log('randomUser: ', randomObject, data)
    if (randomObject) {
        return randomObject;
    } else {
        return -1;
    }
};

function getRandomObjectFromArray(array) {
    if (Array.isArray(array) && array.length > 0) {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    } else {
        return null; // Return null if the array is empty or not an array
    }
};

function getRandomObjectFromDict(obj) {
    var keys = Object.keys(obj);
    if (keys.length > 0) {
        var rd = keys.length * Math.random() << 0;
        console.log('getRandomObjectFromDict: ', rd, obj);
        return [keys[rd], obj[keys[rd]]];
    } else {
        return null;
    }
}

function removeUser(mid) {
    console.log('removeUser: ', mid);
    delete userData[mid];
}

function filterDataByGrp(jsonData, grp, ValueToFilter) {
    return Object.keys(jsonData)
        .filter(key => jsonData[key][grp] === ValueToFilter)
        .reduce((key) => {
            delete jsonData[key];
            console.log('filterDataByGrp: ', jsonData, grp, ValueToFilter, key)
            return jsonData;
        }, {});
}

// function filterDataByGrp(jsonData, grp, ValueToFilter) {
//     console.log('filterDataByGrp: ', jsonData, grp, ValueToFilter)
//     const filteredData = {};
//     Object.keys(jsonData).forEach(key => {
//         console.log('filteredData: ', typeof jsonData[key][grp],typeof ValueToFilter)
//         console.log("|"+jsonData[key][grp]+"|", "|"+ValueToFilter+"|")
//         if (jsonData[key][grp] === ValueToFilter) {
//             console.log('BINGO: ', jsonData[key][grp], ValueToFilter)
//             filteredData[key] = jsonData[key];
//         }
//         // console.log('filteredData: ', filteredData)
//     });
//     return filteredData;
// }

// var displayChampions = function (r, data) {
//     const championsListDiv = document.getElementById('championsList');
//     const championDiv = document.createElement('div');
//     championDiv.innerHTML = `<label>Round ${r}:</label></br>${data.join(', ')}</br>`;
//     championsListDiv.appendChild(championDiv);
// }

var addChampionList = function (r){
    if (document.getElementById(`champ-${r}`)){
        return
    }
    const parent = document.getElementById('champions-list-ul');
    var child = document.createElement('li');
    child.innerHTML = `<li class="list-group-item active champ-list-label">Round ${r}</li><li class="list-group-item champ-list" id="champ-${r}"></li>`;
    parent.appendChild(child);
}

var addChampionBalls = function (r, data) {
    const parent = document.getElementById(`champ-${r}`);
    var child = document.createElement('span');
    child.innerHTML = `<span class="badge badge-primary">${data}</span>`;
    parent.appendChild(child);
}

function callRound(n, r, data) {
    console.log("callRound: ", n, r, data)
    var row = document.getElementById('round' + n + r).value;
    var tk = document.getElementById('ticker' + n + r);
    var table = document.getElementById("randomData" + n + r);
    table.style.display = "none";
    table.innerHTML = "<tr><th>ID</th><th>Team</th><th>Prio</th><th>Name</th></tr>";
    var t = (5 - r) * 1000;
    table.style.display = 'none';
    var arc = [];
    if (conf.show_archived){
        addChampionList(r)
    }
    for (let index = 0; index < row; index++) {
        var rduser = randomUser(data);
        console.log('randomUser: ', rduser);
        if (conf.animation) {
            var nElem = document.createElement("div");
            var tickerc = '<div id="t' + n + r + index + '" class="tick" data-value="000" data-did-init="handleTickInit" data-change="' + rduser[0] + '"><div data-repeat="true" data-layout="horizontal fit" data-transform="arrive(9, .00001) -> round -> pad(\'000\') -> split -> delay(rtl, ' + t + ', ' + t + ')"><span data-view="flip"></span></div></div>';
            nElem.innerHTML = tickerc;
            tk.appendChild(Tick.DOM.create(nElem, { value: 0 }).root);
            Tick.DOM.parse(nElem);
        }
        if (conf.show_raw_data) {
            const newElem = document.createElement("tr");
            newElem.innerHTML = "<td>" + rduser[0] + "</td><td>" + rduser[1]['team'] + "</td><td>" + rduser[1]['priority'] + "</td><td>" + rduser[1]['name'] + "</td>";
            table.appendChild(newElem);
        }
        if (conf.show_archived){
            addChampionBalls(r, rduser[0])
        }
        arc.push(rduser[0]);
        removeUser(rduser[0]);
        if (conf.remove_team_in_rounds.indexOf(r) !== -1) {
            data = filterDataByGrp(data, 'team', rduser[1]['team']);
        }
        console.log(archived);
    }
    archived[r] = arc;
    table.style.display = '';
    // setTimeout(function(){table.style.display = ''}, t * 3 * 9);
}

var btn_init = function(){
    const buttonr4 = document.getElementById("randomBtnR4");
    buttonr4.addEventListener("click", function () {
        callRound('R', 4, userData);
        userData = filterDataByGrp(userData, 'priority', 4);
        console.log('buttonr4: ', Object.keys(userData).length)
        buttonr4.style.display = 'none';
    });
    const buttonr3 = document.getElementById("randomBtnR3");
    buttonr3.addEventListener("click", function () {
        callRound('R', 3, userData);
        userData = filterDataByGrp(userData, 'priority', 3);
        console.log('buttonr4: ', Object.keys(userData).length)
        buttonr3.style.display = 'none';
    });
    const buttonr2 = document.getElementById("randomBtnR2");
    buttonr2.addEventListener("click", function () {
        callRound('R', 2, userData);
        console.log('buttonr4: ', Object.keys(userData).length)
        buttonr2.style.display = 'none';
    });
    const buttonr1 = document.getElementById("randomBtnR1");
    buttonr1.addEventListener("click", function () {
        callRound('R', 1, userData);
        console.log('buttonr4: ', Object.keys(userData).length)
        buttonr1.style.display = 'none';
    });
}

var init = function(){
    getData(data_file);
    stageInit();
    btn_init();
}

init();