'use strict';

import {Collisions, Polygon} from 'collisions';

var Tank = require('./tank').Tank;
// var Wall = require('./wall').Wall;
var Projectile = require('./projectile').Projectile;

class Game {
	constructor() {
		this.system = new Collisions();
		this.tanks = {};
		this.keyboards = {};
		this.walls = [];
		this.projectiles = [];
		for (let i = 0; i < 500; i++) {
			this.projectiles.push(new Projectile(this.system));
		}
		this.projectileSearchIterator = 0;
		this.wallsChanged = false;
		this.loadMap('smol');
	}

	newClient(id) {
		var s = this.newSpawnPosition();
		
		var tank = new Tank(s.x, s.y, s.r, './data/tanks/bulldozer.json', 'MASNY CZOU');
		tank.insertInto(this.system);
		this.tanks[id] = tank;
		this.keyboards[id] = {};
	}

	reloadTemplates()
	{
		for (let id in this.tanks) {
			var tank = this.tanks[id];
			// tank.applyTemplate('./data/tanks/bulldozer.json');
			tank.reloadTemplate();
		}
	}

	removeClient(id) {
		this.tanks[id].removeFrom(this.system);
		delete this.tanks[id];
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
					//TODO apply some charge damage, condition above translations on masses
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
		var x = Math.random() * 500;
		var y = Math.random() * 500;
		var r = Math.random() * 359;
		
		return {x:x, y:y, r:r};
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