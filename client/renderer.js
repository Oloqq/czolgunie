var canvasWidth = 600;
var canvasHeight = 600;
var lockedCameraZoom = 1;
var freeCameraZoom = 1;
var camerax = 0;
var cameray = 0;
var cameraSpeed = 16;
var freeCamera = false;

var deadTankColors = {
	body: "#808080",
	turret: "#A9A9A9",
	barrel: "#A9A9A9",
}

function renderUI(gameData) {
	let centerx = canvasWidth / 2;
	let centery = canvasHeight / 2;

	var tanks = gameData.tanks;
	document.getElementById('hp').innerText = 'hp%: ' + (tanks[id].hpFraction * 100);

	if (tanks[id].hpFraction <= 0) {
		ctx.font = fontSize + "px " + fontName;
		ctx.textAlign = 'center';
		ctx.fillStyle = '#000000';
		ctx.fillText('F', centerx, centery);
		ctx.font = fontSize / 2 + "px " + fontName;
		ctx.fillText('space to respawn', centerx, centery + fontSize * 2 / 3);
	}
}

function renderMenu() {
	let centerx = canvasWidth / 2;
	let centery = canvasHeight / 2;

	ctx.font = fontSize + "px " + fontName;
	ctx.textAlign = 'center';
	ctx.fillStyle = '#FFFFFF';
	ctx.fillText('------>>>>>>>>', centerx, centery);
	ctx.fillText('Customize then join', centerx, centery + fontSize);
}

function render(camerax, cameray, zoom, tanks, walls, projectiles) {
	let centerx = canvasWidth / 2 / zoom;
	let centery = canvasHeight / 2 / zoom;

	//tanks
	for (let id in tanks) {
		let t = tanks[id];
		let ts = tanksStatic[id];
		let colors;

		//get colors
		if (ts == undefined) return;
		if (t.hpFraction > 0) {
			colors = {
				body: ts.color,
				turret: ts.tower.color,
				gun: ts.gun.color,
			}
		} else {
			colors = deadTankColors;
		}

		//body
		ctx.fillStyle = colors.body;
		ctx.scale(zoom, zoom);
		ctx.translate(centerx - (camerax - t.x), centery - (cameray - t.y));
		ctx.rotate(t.angle);

		ctx.beginPath();
		for (let i = 0; i < ts.points.length; i++) {
			ctx.lineTo(ts.points[i][0], ts.points[i][1]);
		}
		ctx.closePath();
		ctx.fill();

		//tower and barrel
		ctx.fillStyle = colors.turret;
		ctx.translate(ts.tower.x, 0);
		ctx.rotate(t.towerRotation);
		ctx.fillRect(-ts.tower.length / 2, -ts.tower.width / 2,
			ts.tower.length, ts.tower.width);

		ctx.fillStyle = colors.gun;
		ctx.fillRect(0, -ts.gun.width / 2, ts.gun.length, ts.gun.width);

		//names, hp bar
		ctx.rotate(-(t.angle + t.towerRotation));
		ctx.fillStyle = '#C0C0C0';
		ctx.font = 8 + "px " + fontName;
		ctx.textAlign = 'center';
		ctx.fillText(ts.name, 0, 0);

		let barWidth = 40;
		let h = 5;
		ctx.fillStyle = "#FF0000";
		ctx.fillRect(-barWidth / 2, 2, barWidth, h);

		ctx.fillStyle = "#00FF00";
		ctx.fillRect(-barWidth / 2, 2, barWidth*t.hpFraction, h);

		ctx.resetTransform();
	};

	for (let i in projectiles) {
		let p = projectiles[i];
		ctx.fillStyle = p.color;
		ctx.scale(zoom, zoom);
		ctx.translate(centerx - (camerax - p.x), centery - (cameray - p.y));
		ctx.rotate(p.angle);

		ctx.beginPath();
		ctx.arc(0, 0, p.radius, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();

		ctx.resetTransform();
	}

	//walls
	walls.forEach((w) => {
		ctx.fillStyle = w.color;
		ctx.scale(zoom, zoom);
		ctx.translate(centerx - (camerax - w.x), centery - (cameray - w.y));
		ctx.rotate(w.angle);

		ctx.beginPath();
		for (let i = 0; i < w.points.length; i++) {
			ctx.lineTo(w.points[i][0], w.points[i][1]);
		}
		ctx.closePath();
		ctx.fill();

		ctx.resetTransform();
	});
}