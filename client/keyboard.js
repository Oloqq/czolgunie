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

function getKeysToSend() {
	let keysToSend = {};
	keysToSend['w'] = keys['w'];
	keysToSend['a'] = keys['a'];
	keysToSend['s'] = keys['s'];
	keysToSend['d'] = keys['d'];
	keysToSend[' '] = keys[' '];
	keysToSend['up'] = keys['arrowup'];
	keysToSend['left'] = keys['arrowleft'];
	keysToSend['right'] = keys['arrowright'];
	return keysToSend;
}

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