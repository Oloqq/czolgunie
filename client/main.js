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

socket.on('init', (idFromServer, isGamemaster, gameData) => {
	id = idFromServer;
	if (isGamemaster) {
		document.getElementById("gamemaster").style.visibility = 'visible';
	} else {
		document.getElementById("gamemaster").style.visibility = 'hidden';
	}
	wallsStatic = gameData.walls;
	tanksStatic = gameData.tanks;
});

socket.on('someone connected', (staticTankData) => {
	tanksStatic = staticTankData;
});

socket.on('someone disconnected', (id) => {
	delete tanksStatic[id];
});

socket.on('update', (gameData) => {
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
});

