'use strict';

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var fontSize = 48;
var fontName = "Verdana";
ctx.font = fontSize + "px " + fontName;

var socket = io();

var state = "menu";

var id = -1;
var wallsStatic;
var tanksStatic;

function emit(event, data) {
	socket.emit(event, id, data);
}

socket.on('init connection', (idFromServer, isGamemaster, classes, maps) => {
	id = idFromServer;
	if (isGamemaster) {
		document.getElementById("gamemaster").style.visibility = 'visible';
	} else {
		document.getElementById("gamemaster").style.visibility = 'hidden';
	}

	if (classes) {
		let options = document.getElementById("classesSelect");
		for (let i = 0; i < classes.length; i++) {
			let name = classes[i].replace('.json', '');
			name = name.substr(0, 1).toUpperCase() + name.slice(1);
			options.innerHTML += "<option>" + name + "</option>"
		}
	}
	if (maps) {
		let options = document.getElementById("mapsSelect");
		for (let i = 0; i < classes.length; i++) {
			let name = classes[i].replace('.json', '');
			name = name.substr(0, 1).toUpperCase() + name.slice(1);
			options.innerHTML += "<option>" + name + "</option>"
		}
	}

	emit('start game', {});
});

socket.on('init game', (gameData) => {
	wallsStatic = gameData.walls;
	tanksStatic = gameData.tanks;
	state = 'game';
});

socket.on('someone joined', (staticTankData) => {
	tanksStatic = staticTankData;
});

socket.on('someone disconnected', (id) => {
	delete tanksStatic[id];
});

socket.on('update', (gameData) => {
	if (state == 'menu') {
		renderMenu();
	}
	else if (state == 'game') {
		if (!gameData) return;
		var tanks = gameData.tanks;
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	
		if (freeCamera) {
			if (keys['5']) { //kp5
				cameray += cameraSpeed;
			}
			if (keys['4']) { //kp4
				camerax -= cameraSpeed;
			}
			if (keys['6']) { //kp6
				camerax += cameraSpeed;
			}
			if (keys['8']) { //kp8
				cameray -= cameraSpeed;
			}
			render(camerax, cameray, freeCameraZoom, tanks, wallsStatic, gameData.projectiles);
		} else {
			render(tanks[id].x, tanks[id].y, lockedCameraZoom, tanks, wallsStatic, gameData.projectiles);
		}
		renderUI(gameData);
	
		socket.emit('keyboard state', getKeysToSend());
	}	
});

