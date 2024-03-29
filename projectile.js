var Entity = require('./entity').Entity;

// import {Circle} from "collisions";

class Projectile extends Entity {
  constructor(system) {
    super(0, 0, 20, 0, 'projectile');
    this.insertInto(system);
    this.active = false;
  }

  activate(tank) {
    this.active = true;
    this.master = tank;
    this.body.x = tank.body.x; //TODO spawn at the edge of the barrel
    this.body.y = tank.body.y;
    this.radius = tank.gun.caliber; //will this properly update object in the system?
    this.color = tank.gun.shell.color;

    this.speed = tank.gun.shell.speed;
    this.dx = Math.cos(tank.body.angle + tank.tower.rotation);
    this.dy = Math.sin(tank.body.angle + tank.tower.rotation);

    this.damage = tank.gun.caliber * 4;
  }

  deactivate() {
    this.active = false;
  }

  update(dt) {
    let vx = this.dx * this.speed;
    let vy = this.dy * this.speed;
    this.move(vx * dt, vy * dt);
  }
}

module.exports.Projectile = Projectile;