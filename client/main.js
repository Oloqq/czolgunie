'use strict';

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var fontSize = 48;
var fontName = "Verdana";
ctx.font = fontSize + "px " + fontName;

var socket = io();

var id = -1;
var canvasWidth = 600;
var canvasHeight = 600;
var lockedCameraZoom = 1;
var freeCameraZoom = 1;
var camerax = 0;
var cameray = 0;
var cameraSpeed = 16;
var freeCamera = false;

var wallsStatic;
var tanksStatic;

var deadTankColors = {
    body: "#808080",
    turret: "#A9A9A9",
    barrel: "#A9A9A9",
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

socket.on('someone connected', (staticTankData)=>{
    tanksStatic = staticTankData;  
});

socket.on('someone disconnected', (id)=>{
    delete tanksStatic[id];
});

function emit(event, data) {
    socket.emit(event, id, data);
}

var keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    arrowright: false,
    arrowleft: false,
    arrowup: false,
    arrowdown: false
}
keys[' '] = false;

document.addEventListener("keydown", (ev) => {
    let key = ev.key.toLowerCase();
    if (keys[key]) return;
    keys[key] = true;

    let k = ev.keyCode;
    if (k == 189) { //minus
        lockedCameraZoom -= 0.1;
        if (lockedCameraZoom <= 0.01) lockedCameraZoom = 0.1;
    } 
    if (k == 187) { //plus
        lockedCameraZoom += 0.1;
        if (lockedCameraZoom > 1.5) lockedCameraZoom = 1.5;
    }

    if (k == 48 || k == 96) { //0 or kp0
        //switch camera mode
        freeCamera = freeCamera ? false : true;
    }

    if (k == 109) { //minus
        freeCameraZoom -= 0.1;
        if (freeCameraZoom <= 0.01) freeCameraZoom = 0.1;
    } 
    if (k == 107) { //plus
        freeCameraZoom += 0.1;
        if (freeCameraZoom > 1.5) freeCameraZoom = 1.5;
    }
});

document.addEventListener("keyup", (ev) => {
    let key = ev.key.toLowerCase();
    keys[key] = false;

    // console.log(key);

    if (key == "arrowdown") {
        socket.emit('kill me');
    }
});

socket.on('update', (gameData) => {
    if (!gameData) return;
    var tanks = gameData.tanks;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (freeCamera) {
        if (keys['5']) { //kp2
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

    let keysToSend = {};
    keysToSend['w'] = keys['w'];
    keysToSend['a'] = keys['a'];
    keysToSend['s'] = keys['s'];
    keysToSend['d'] = keys['d'];
    keysToSend[' '] = keys[' '];
    keysToSend['up'] = keys['arrowup'];
    keysToSend['left'] = keys['arrowleft'];
    keysToSend['right'] = keys['arrowright'];
    socket.emit('keyboard state', keysToSend);
});

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
        ctx.fillText('space to respawn', centerx, centery + fontSize * 2/3);
    }
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
        ctx.translate(centerx-(camerax-t.x), centery-(cameray-t.y));
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
        ctx.fillRect(-ts.tower.length/2, -ts.tower.width/2,
            ts.tower.length, ts.tower.width);

        ctx.fillStyle = colors.gun;
        ctx.fillRect(0, -ts.gun.width/2, ts.gun.length, ts.gun.width);
        
        //names
        let effectiveAngle_deg = (t.angle + t.towerRotation) * (180 / Math.PI);
        effectiveAngle_deg = Math.abs((effectiveAngle_deg - 90) % 360);
        if (effectiveAngle_deg > 180) {
            ctx.scale(-1, -1);
        }
        
        ctx.fillStyle = '#C0C0C0';
        ctx.font = 12 + "px " + fontName;
        ctx.textAlign = 'center';
        ctx.fillText(ts.name, 0, 24);

        ctx.resetTransform();
    };    

    for (let i in projectiles) {
        let p = projectiles[i];
        ctx.fillStyle = p.color;
        ctx.scale(zoom, zoom);
        ctx.translate(centerx-(camerax-p.x), centery-(cameray-p.y));
        ctx.rotate(p.angle);
        
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.resetTransform();
    }
    
    //walls
    walls.forEach((w)=>{
        ctx.fillStyle = w.color;
        ctx.scale(zoom, zoom);
        ctx.translate(centerx-(camerax-w.x), centery-(cameray-w.y));
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

document.getElementById('nameSubmit').addEventListener('click', ()=>{
    var name = document.getElementById('name').value;
    console.log(name);
});