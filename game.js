'use strict';

import {Collisions, Polygon} from 'collisions';
const fs = require('fs');

var Tank = require('./tank').Tank;
// var Wall = require('./wall').Wall;
var Projectile = require('./projectile').Projectile;

class Game {
	constructor() {
		this.system = new Collisions();
		this.tanks = {};
		this.keyboards = {};
		this.map = {
			width: 0,
			heigt: 0,
			walls: []
		};
		this.projectiles = [];
		for (let i = 0; i < 500; i++) {
			this.projectiles.push(new Projectile(this.system));
		}
		this.projectileSearchIterator = 0;

		this.classList = [];
		let th = this;
		fs.readdir('data/tanks', (err, files) => {
			if(err) {
				return console.log('Unable to scan directory: ' + err);
			}
			files.forEach(function(file) {
				th.classList.push(file);
			});
		});

		this.mapList = [];
		fs.readdir('data/maps', (err, files) => {
			if(err) {
				return console.log('Unable to scan directory: ' + err);
			}
			files.forEach(function(file) {
				th.mapList.push(file);
			});
		});

		this.wallsChanged = false;
		this.loadMap('bonk');
	}

	newClient(id, data) {
		data.name = data.name.slice(0, 10);
		let classPath = data.tankClass.toLowerCase();

		var s = this.newSpawnPosition();

		var tank = new Tank(s.x, s.y, s.r, './data/tanks/' + classPath + '.json', data.name);
		tank.insertInto(this.system);
		this.tanks[id] = tank;
		this.keyboards[id] = {};
	}

	reloadTemplates()
	{
		for (let id in this.tanks) {
			var tank = this.tanks[id];
			tank.reloadTemplate();
		}
	}

	removeClient(id) {
		if (this.tanks[id]) {
			this.tanks[id].removeFrom(this.system);
			delete this.tanks[id];
		}
		delete this.keyboards[id];
	}

	update(dt) {
		for (let id in this.tanks) {
			let t = this.tanks[id];
			let kb = this.keyboards[id];
			
			if (t.hp > 0) {
				let rq = t.reactToKeyboard(kb, dt);      
			
				if (rq.shoot) { //shoot
					this.getInactiveProjectile().activate(t);
				}  
			} 
			else {
				if (kb.now[' '] && !kb.previous[' ']) {
					let s = this.newSpawnPosition();
					t.respawn(s.x, s.y, s.r * Math.PI / 180)
				}
			}

			t.update(dt);
		}

		for (let i = 0; i < this.projectiles.length; i++) {
			let p = this.projectiles[i];
			if (!p.active) continue;

			p.update(dt);
		}

		this.system.update();

		let result = this.system.createResult();
		//tanks
		for (let id in this.tanks) {
			let t = this.tanks[id];
			const potentials = t.body.potentials();
			for (const p of potentials) {
				if (p.entity.type == 'wall' && t.body.collides(p, result)) {
					t.body.x -= result.overlap * result.overlap_x;
					t.body.y -= result.overlap * result.overlap_y;
					t.preventInPlaceAcceleration();
				}
				if (p.entity.type == 'tank' && t.body.collides(p, result)) {
					t.body.x -= result.overlap * result.overlap_x / 2;
					t.body.y -= result.overlap * result.overlap_y / 2;
					p.x += result.overlap * result.overlap_x / 2;
					p.y += result.overlap * result.overlap_y / 2;
					
					t.ram(p.entity);
				}
			}
		}
		// projectiles 
		for (let i in this.projectiles) {
			let proj = this.projectiles[i];
			if (!proj.active) continue;
			const potentials = proj.body.potentials();
			for (const po of potentials) {
				if (po.entity.type == 'wall' && proj.body.collides(po, result)) {
					proj.deactivate();
				}
				if (po.entity.type == 'tank' && proj.body.collides(po, result)) {
					if (po.entity != proj.master) {
						po.entity.hurt(proj.damage);
						proj.deactivate();
					}
				}
			}
		}
	}

	newSpawnPosition() {
		const margin = 20;
		var x = Math.random() * (this.map.width - margin * 2) - margin;
		var y = Math.random() * (this.map.height - margin * 2) - margin;
		var r = Math.random() * 359;
		
		return {x:x, y:y, r:r};
	}

	outOfMap(entity) {
		var b = entity.body;
		if (b.x < 0) return true;
		if (b.y < 0) return true;
		if (b.x > this.map.width) return true;
		if (b.y > this.map.height) return true;

		return false;
	}

	randomizePlayerPositions() {
		for (let id in this.tanks) {
			let t = this.tanks[id];
			do {
				let pos = this.newSpawnPosition();
				t.body.x = pos.x
				t.body.y = pos.y;
				t.body.angle = pos.r;
				t.setSpeed(0);
				// keep pushing the tank out of walls until it is definitely out
				let ok = true;
				while(!ok) {
					ok = true;
					const potentials = t.body.potentials();
					for (const p of potentials) {
						if (p.entity.type == 'wall' && t.body.collides(p, result)) {
							t.body.x -= result.overlap * result.overlap_x;
							t.body.y -= result.overlap * result.overlap_y;
							ok = false;
						}
					}
				}
			} while(this.outOfMap(t));
		}
	}

	getInactiveProjectile() {
		let starting = this.projectileSearchIterator;
		while (this.projectiles[this.projectileSearchIterator].active) {
			this.projectileSearchIterator++;
			if (this.projectileSearchIterator >= this.projectiles.length) {
				this.projectileSearchIterator = 0;
				continue;
			}
			if (this.projectileSearchIterator == starting) {
				console.log("TOOO FEEEWWW PROJECTILESSSSSSSSSSSSSSSSSSSSS");
				//TODO increase the size of the array
				break;
			}
		}
		return this.projectiles[this.projectileSearchIterator];
	}
}

Game = require('./game.map')(Game);
Game = require('./game.connect')(Game);

module.exports.Game = Game;