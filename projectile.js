var Entity = require('./entity').Entity;

import {Circle} from "collisions";

const dt = 0.02; //projectile class also has this, dont change just one
                 //i was too lazy to do something properly with it

class Projectile extends Entity {
  constructor() {
    super(0, 0, 20, 0, 'projectile');
    this.active = false;    
  }

  activate(tank) {
    this.active = true;
    this.master = tank;
    this.body.x = tank.body.x;
    this.body.y = tank.body.y
  }

  deactivate() {

  }

  update() {

  }
}

module.exports.Projectile = Projectile;