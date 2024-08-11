var saveGender = "M"
var detailsGender = ""
var listGender = "M"
var saveEdit = false;
var fullData, playersData
var urlBase = 'https://geopagos-challenge.onrender.com/geopagos/'

function initPlayer() {
    var saveGender = "M"
    var detailsGender = ""
    var listGender = "M"
    document.getElementById('toggleDetailRT').style.display = "none"
    fetch(urlBase + 'player')
    .then(function (response) {
        return response.json();
    })
    .then(function (jsonResponse) {
        fullData = jsonResponse.data
        playersData = fullData.filter((data) => data.gender == listGender);
        refreshPlayersTable()
        document.getElementById('splash').classList.add('hide')
    })
    .catch(err => console.log(err))
    initTournament()
}

function refreshPlayersTable() {
    var tableData = ""
    for (var i = 0; i < playersData.length; i++) {
        tableData += '<tr id="player'+i+'" onclick="showDetails(\''+i+'\')"'+(playersData[i].active?' ':' class="deletedRow"')+'><td>'+playersData[i].playerId+'</td><td>'+playersData[i].name+'</td><td>'+(playersData[i].active?'Activo':'Inactivo')+'</td><td><button class="dataEdit" onclick="editPlayer(\''+i+'\')">Editar</button><button class="dataDelete" onclick="deletePlayer(\''+i+'\')">Eliminar</button></td></tr>'
    }
    document.getElementById('playersDataTable').innerHTML = tableData;
}

function showDetails(player) {
    document.getElementById('detailId').textContent = playersData[player].playerId
    document.getElementById('detailName').textContent = playersData[player].name
    document.getElementById('detailGender').textContent = playersData[player].gender == 'M' ? 'Masculino' : 'Femenino'
    document.getElementById('detailGender').classList.remove('blue', 'pink')
    document.getElementById('detailGender').classList.add(playersData[player].gender == 'M' ? 'blue' : 'pink')
    document.getElementById('detailSkill').style.width = playersData[player].skill + "%"
    document.getElementById('detailSkill').innerHTML = '<a>'+playersData[player].skill+'</a>'
    document.getElementById('detailStrength').style.width = playersData[player].strength + "%"
    document.getElementById('detailStrength').innerHTML = '<a>'+playersData[player].strength+'</a>'
    if (listGender == "M") {
        document.getElementById('detailStrength').style.width = playersData[player].strength + "%"
        document.getElementById('detailStrength').innerHTML = '<a>'+playersData[player].strength+'</a>'
        document.getElementById('detailSpeed').style.width = (playersData[player].speed * 2) + "%"
        document.getElementById('detailSpeed').innerHTML = '<a>'+playersData[player].speed+'</a>'
        document.getElementById('toggleDetailST').style.display = "flex"
        document.getElementById('toggleDetailSP').style.display = "flex"
        document.getElementById('toggleDetailRT').style.display = "none"
    } else {
        document.getElementById('detailReactionTime').style.width = (playersData[player].reactionTime * 100) + "%"
        document.getElementById('detailReactionTime').innerHTML = '<a>'+playersData[player].reactionTime+'</a>'
        document.getElementById('toggleDetailST').style.display = "none"
        document.getElementById('toggleDetailSP').style.display = "none"
        document.getElementById('toggleDetailRT').style.display = "flex"
    }
}

function editPlayer(player) {
    saveEdit = true
    updateId = player
    toggleSaveGender(playersData[player].gender)
    setInputForm(
        'Editar Jugador - ID: ' + playersData[player].playerId, 
        playersData[player].name, 
        playersData[player].skill, 
        playersData[player].strength,
        playersData[player].speed,
        playersData[player].reactionTime
    )
    textInput(playersData[player].name)
}

function savePlayerData() {
    document.getElementById('processing').classList.remove('hide')
    var newPlayer = {
        name: document.getElementById('name').value, 
        gender: saveGender == "M" ? 'MALE' : 'FEMALE', 
        skill: document.getElementById('skill').value, 
        strength: saveGender == "M" ? document.getElementById('strength').value : null, 
        speed: saveGender == "M" ? document.getElementById('speed').value : null, 
        reactionTime: saveGender == "F" ? document.getElementById('reactionTime').value / 100 : null
    }
    if (saveEdit) {
        fetch(urlBase + 'player/' + playersData[updateId].playerId, {
            method: "PUT",
            body: JSON.stringify(newPlayer),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json())
        .then(function (json) {
            fullData = fullData.filter((data) => data.playerId != json.data[0].playerId)
            fullData.push(json.data[0])
            playersData = fullData.filter((data) => data.gender == listGender);
            refreshPlayersTable()
            document.getElementById('processing').classList.add('hide')
        })
        .catch(function (err) {
            document.getElementById('processing').classList.add('hide')
            console.log(err)
        })
    } else {
        fetch(urlBase + 'player', {
            method: "POST",
            body: JSON.stringify(newPlayer),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json())
        .then(function (json) {
            fullData.push(json.data[0])
            playersData = fullData.filter((data) => data.gender == listGender);
            refreshPlayersTable()
            document.getElementById('processing').classList.add('hide')
        })
        .catch(function (err) {
            document.getElementById('processing').classList.add('hide')
            console.log(err)
        })
    }
    clearSaveForm()
}

function deletePlayer(player) {
    document.getElementById('processing').classList.remove('hide')
    var deletedId = playersData[player].playerId
    fetch(urlBase + 'player/' + deletedId, {
        method: "DELETE",
        headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(function () {
        for (var i = 0; i < fullData.length; i++) {
            if (fullData[i].playerId == deletedId) {
                fullData[i].active = false
                break
            }
        }
        playersData = fullData.filter((data) => data.gender == listGender);
        refreshPlayersTable()
        document.getElementById('processing').classList.add('hide')
    })
    .catch(function (err) {
        document.getElementById('processing').classList.add('hide')
        console.log(err)
    })
}

function updateValue(elementId, value) {
    document.getElementById(elementId).textContent = value;
}

function toggleListGender(gender) {
    if (listGender != gender) {
        if (gender == "M") {
            listGender = "M"
            document.getElementById('listMale').classList.add('male-btn')
            document.getElementById('listFemale').classList.remove('female-btn')
        } else {
            listGender = "F"
            document.getElementById('listFemale').classList.add('female-btn')
            document.getElementById('listMale').classList.remove('male-btn')
        }
        playersData = fullData.filter((data) => data.gender == listGender);
        refreshPlayersTable()
    }
}

function toggleSaveGender(gender) {
    if (saveGender != gender) {
        if (gender == "M") {
            saveGender = "M"
            document.getElementById('saveMale').classList.add('male-btn')
            document.getElementById('saveFemale').classList.remove('female-btn')
            document.getElementById('saveReactionTime').classList.add('hide')
            document.getElementById('saveStrength').classList.remove('hide')
            document.getElementById('saveSpeed').classList.remove('hide')
        } else {
            saveGender = "F"
            document.getElementById('saveFemale').classList.add('female-btn')
            document.getElementById('saveMale').classList.remove('male-btn')
            document.getElementById('saveReactionTime').classList.remove('hide')
            document.getElementById('saveStrength').classList.add('hide')
            document.getElementById('saveSpeed').classList.add('hide')
        }
    }
}

function textInput(text) {
    if (text == null || text == "") {
        document.getElementById('cancel-save-btn').classList.remove('cancel-btn')
        document.getElementById('save-save-btn').classList.remove('save-btn')
        document.getElementById('cancel-save-btn').disabled = true
        document.getElementById('save-save-btn').disabled = true
    } else {
        document.getElementById('cancel-save-btn').classList.contains('cancel-btn') ? null : document.getElementById('cancel-save-btn').classList.add('cancel-btn')
        document.getElementById('save-save-btn').classList.contains('save-btn') ? null : document.getElementById('save-save-btn').classList.add('save-btn')
        document.getElementById('cancel-save-btn').disabled = false
        document.getElementById('save-save-btn').disabled = false
    }
}

function clearSaveForm() {
    saveEdit = false
    toggleSaveGender("M")
    setInputForm('Guardar Jugador', '', 50, 50, 25, 0.5)
    textInput('')
}

function setInputForm(title, name, skill, strength, speed, reactionTime) {
    document.getElementById('name').value = name;
    document.getElementById('skill').value = skill;
    document.getElementById('strength').value = strength
    document.getElementById('speed').value = speed
    document.getElementById('reactionTime').value = reactionTime * 100
    document.getElementById('skillValue').textContent = skill
    document.getElementById('strengthValue').textContent = strength
    document.getElementById('speedValue').textContent = speed
    document.getElementById('reactionTimeValue').textContent = reactionTime
    document.getElementById('save-title').textContent = title
}
