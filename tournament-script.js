var tournamentList
var tournamentShow
var urlBase = 'https://geopagos-challenge.onrender.com/geopagos/'

var checkedGender = 'M'
var tournamentDate = null
var tournamentName = ''
var playerListToSelect
var quantity = 0

function toggleView() {
    document.getElementById('player-list-container').classList.toggle('hide')
    document.getElementById('player-form-container').classList.toggle('hide')
    document.getElementById('player-details-container').classList.toggle('hide')
    document.getElementById('tournament-list-container').classList.toggle('hide')
    document.getElementById('tournament-create-container').classList.toggle('hide')
    document.getElementById('tournament-view-container').classList.toggle('hide')
    if (document.getElementById('toggleButton').textContent == 'Administrar Torneos')
        document.getElementById('toggleButton').textContent = 'Administrar Jugadores'
    else
        document.getElementById('toggleButton').textContent = 'Administrar Torneos'
}

function initTournament() {
    fetch(urlBase + 'tournament/list')
    .then(function (response) {
        return response.json();
    })
    .then(function (jsonResponse) {
        tournamentList = jsonResponse.tournaments
        refreshTournamentTable()
    })
}

function refreshTournamentTable() {
    var tableData = ""
    for (var i = 0; i < tournamentList.length; i++) {
        tableData += '<tr id="tournament'+i+'" onclick="showTournament(\''+i+'\')"><td>'+tournamentList[i].tournament_id+'</td><td>'+tournamentList[i].name+'</td><td>'+(tournamentList[i].type == 'male' || tournamentList[i].type == 'MALE'?'Masculino':'Femenino')+'</td></tr>'
    }
    document.getElementById('tournamentDataTable').innerHTML = tableData;
}

function showTournament(tournament) {
    document.getElementById('processing').classList.remove('hide')
    if (document.getElementsByClassName('selected').length > 0)
        document.getElementsByClassName('selected')[0].classList.remove('selected')
    document.getElementById('tournament' + tournament).classList.add('selected')
    var tournamentRequest = {name: tournamentList[tournament].name}
    fetch(urlBase + 'tournament/query', {
        method: "POST",
        body: JSON.stringify(tournamentRequest),
        headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json())
    .then(function (json) {
        tournamentShow = json
        drawTournamentView()
        document.getElementById('processing').classList.add('hide')
    })
    .catch(function (err) {
        document.getElementById('processing').classList.add('hide')
        console.log(err)
    })
}

function drawTournamentView() {
    var view = document.getElementById('tournament-fixture')
    document.getElementById('tournament-title').textContent = 'Vista Torneo: ' + tournamentShow.name
    var graphics = ''
    var phases = tournamentShow.phases
    for (var phase = 0; phase < phases.length; phase++) {
        var games = tournamentShow.phases[phase].phase_games
        for (var game = 0; game < games.length; game++) {
            graphics += '<div id="c'+(phase+''+game)+'" class="game-container" style="margin-left:'+(20+300*phases[phase].phase_number)+'px;top:'+calculateTop(phase, game)+'px;height:'+calculateHeigth(phase)+'px"><div class="winner" style="top:0"><h6>'+games[game].winner_name+'</h6></div><div class="loser" style="top:'+(calculateHeigth(phase)-50)+'px"><h6>'+games[game].loser_name+'</h6></div><div class="vs-line" style="height:'+(calculateHeigth(phase)-50)+'px"></div><div class="wn-line" style="top:'+(calculateHeigth(phase)/2)+'px"></div></div>'
        }
    }
    graphics += '<div class="game-container" style="margin-left:'+(20+300*phases.length)+'px;top:'+calculateTop(phases.length-1, 0)+'px;height:'+calculateHeigth(phases.length-1)+'px"><div class="winner" style="top:'+(calculateHeigth(phases.length-1)/2-25)+'px"><h6>'+tournamentShow.winner.name+'</h6></div></div>'
    view.innerHTML = graphics
    fixCrossedPlayers(phases.length)
}

function calculateHeigth(i) {
    var result = 0
    var dif = 0
    if (i > 1)
        result = i * i - (i - 1) * (i - 1)
    else
        return 120 + 70 * i
    i == 3 ? dif = 140 : dif = 0
    i == 4 ? dif = 560 : null
    return 120 + result * 70 + dif
}

function calculateTop(phase, game) {
    var dif = 0
    var i = game + 1
    if (phase > 0) {
        var i = nextImpar(phase + game)
        dif = 35 * i
    }
    phase == 2 ? dif += 140 * game : null
    phase == 3 ? dif += 70 + (game * 70 * 6) : null
    phase == 4 ? dif += 280 : null
    return 20 + (calculateHeigth(phase) + 20) * game + dif
}

function nextImpar(i) {
    var result = 0
    for (var j = 0; j < i; j++) {
        do {
            result++
        } while (result % 2 == 0)
    }
    return result
}

function fixCrossedPlayers(phases) {
    for (var phase = 1; phase < phases; phase++) {
        var games = tournamentShow.phases[phase].phase_games.length
        for (var game = 0; game < games; game++) {
            var container = document.getElementById('c'+phase+''+game)
            var winner = container.getElementsByClassName('winner')[0].getElementsByTagName('h6')[0].textContent
            var prev = document.getElementById('c'+(phase-1)+''+(nextImpar(game+1)-1))
            if (prev.innerHTML.indexOf(winner) < 0) {
                var topOne = container.getElementsByClassName('winner')[0].style.top
                var topTwo = container.getElementsByClassName('loser')[0].style.top
                container.getElementsByClassName('winner')[0].style.top = topTwo
                container.getElementsByClassName('loser')[0].style.top = topOne
            }
        }
    }
}

function checkGender(gender) {
    if (gender == checkedGender) {
        document.getElementById('typeT' + gender).checked = 'checked'
    } else {
        document.getElementById('typeT' + gender).checked = 'checked'
        document.getElementById('typeT' + (gender == 'M' ? 'F' : 'M')).checked = null
        checkedGender = gender
    }
}

function setDate(date) {
    tournamentDate = date
    if (date != null && tournamentName != '' && validYear(date)) {
        document.getElementById('create-tournament-btn').classList.add('save-btn')
        document.getElementById('create-tournament-btn').disabled = false
    } else {
        document.getElementById('create-tournament-btn').classList.remove('save-btn')
        document.getElementById('create-tournament-btn').disabled = true
    }
}

function tournamentNameInput(name) {
    tournamentName = name
    if (name != '' && tournamentDate != null && validYear(tournamentDate)) {
        document.getElementById('create-tournament-btn').classList.add('save-btn')
        document.getElementById('create-tournament-btn').disabled = false
    } else {
        document.getElementById('create-tournament-btn').classList.remove('save-btn')
        document.getElementById('create-tournament-btn').disabled = true
    }
}

function validYear(date) {
    var parts = date.split('-')
    return 1700 < parts[0] && 2100 > parts[0]
}

function createTournament() {
    document.getElementById('processing').classList.remove('hide')
    document.getElementById('player-select-container').classList.remove('hide')
    loadPlayers()
}

function loadPlayers() {
    var gender = document.getElementById('typeTM').checked? 'M' : 'F'
    playerListToSelect = fullData.filter((data) => data.gender == gender)
    playerListToSelect = playerListToSelect.filter((data) => data.active == true)
    var tableData = ""
    for (var i = 0; i < playerListToSelect.length; i++) {
        tableData += '<tr id="playerT'+i+'" onclick="selectPlayer('+i+')"><td class="pid">'+playerListToSelect[i].playerId+'</td><td>'+playerListToSelect[i].name+'</td></tr>'
    }
    document.getElementById('player-select-table-data').innerHTML = tableData;
}

function cancelTournament() {
    quantity = 0
    document.getElementById('playerQ').value = quantity
    document.getElementById('processing').classList.add('hide')
    document.getElementById('player-select-container').classList.add('hide')
    document.getElementById('call-create-tournament').classList.remove('active-btn')
    document.getElementById('call-create-tournament').disabled = true
}

function selectPlayer(id) {
    document.getElementById('playerT'+id).classList.toggle('selected')
    var table = document.getElementById('player-select-table-data')
    quantity = table.getElementsByClassName('selected').length
    document.getElementById('playerQ').value = quantity

    if (isValidQuantity(quantity)) {
        document.getElementById('call-create-tournament').classList.add('active-btn')
        document.getElementById('call-create-tournament').disabled = false
    } else {
        document.getElementById('call-create-tournament').classList.remove('active-btn')
        document.getElementById('call-create-tournament').disabled = true
    }
}

function autoselect(checked) {
    if(checked) {
        document.getElementById('playerQ').disabled = false
        document.getElementById('table-blocked').classList.remove('hide')
    } else {
        document.getElementById('playerQ').disabled = true
        document.getElementById('table-blocked').classList.add('hide')
    }
    quantity = 0
    document.getElementById('playerQ').value = null
    var tableData = document.getElementById('player-select-table-data')
    var selectedItems = tableData.getElementsByClassName('selected')
    document.getElementById('call-create-tournament').classList.remove('active-btn')
    document.getElementById('call-create-tournament').disabled = true
    while (selectedItems.length > 0) {
        for (var item of selectedItems) {
            item.classList.remove('selected')
        }
        selectedItems = tableData.getElementsByClassName('selected')
    }
}

function isValidQuantity(value) {
    var count = 1
    while (count < value) {
        count *= 2
    }
    return value == count && count != 1
}

function validateQuantity(value) {
    if (isValidQuantity(value) && value <= playerListToSelect.length) {
        document.getElementById('call-create-tournament').classList.add('active-btn')
        document.getElementById('call-create-tournament').disabled = false
    } else {
        document.getElementById('call-create-tournament').classList.remove('active-btn')
        document.getElementById('call-create-tournament').disabled = true
    }
    quantity = value
}

function callTournamentCreate() {
    document.getElementById('processing').style.zIndex = 4
    var isAuto = document.getElementById('auto-select').checked
    var date = document.getElementById('dateT').value
    var request = {
        name: document.getElementById('nameT').value,
        type: document.getElementById('typeTM').checked ? 'male' : 'female',
        date: date.substring(8, 10) + '/' + date.substring(5, 7) + '/' + date.substring(0, 4),
    }
    if (!isAuto) {
        var tableData = document.getElementById('player-select-table-data')
        var selectedItems = tableData.getElementsByClassName('selected')
        var idList = []
        for (var item of selectedItems) {
            idList.push(item.getElementsByClassName('pid')[0].textContent)
        }
        request.player_ids = idList
    } else {
        request.competitors = quantity
    }
    var url = urlBase + 'tournament'
    isAuto ? url += '/random' : null
    callService(url, request)
}

function callService(url, request) {
    fetch(url, {
        method: "POST",
        body: JSON.stringify(request),
        headers: new Headers({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }),
    })
    .then(response => response.json())
    .then(function (json) {
        initTournament()
        tournamentShow = json
        drawTournamentView()
        cancelTournament()
        document.getElementById('processing').style.zIndex = 1
    })
    .catch(function (err) {
        cancelTournament()
        document.getElementById('processing').style.zIndex = 1
        console.log(err)
    })
}