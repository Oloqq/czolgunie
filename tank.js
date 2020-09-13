var Entity = require('./entity').Entity;

class Tank extends Entity {
  constructor(x, y, angle_deg, tankTemplate, gunTemplate, name) {
    var template = require(tankTemplate);
    template.gun = require(gunTemplate);
    
    var pts = [[-template.length/2, - template.width/2], [template.length/2, - template.width/2],
               [template.length/2, template.width/2], [-template.length/2, template.width/2]];
    var angle_rad = angle_deg * Math.PI / 180;

    //construct entity
    super(x, y, pts, angle_rad, 'tank');
    this.applyTemplate(template)
    this.respawn(x, y, angle_rad);
    this.name = name;
  }

  hurt(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
    }
  }

  respawn(x, y, r) {
    //position
    this.body.x = x;
    this.body.y = y;
    this.body.angle = r;

    //dimensions
    this.tower.rotation = 0;

    //movement
    this.speed = 0;
    this.accelerated = false;
    this.acceleration = 0;
    // this.rotationSpeed;
    this.adjustAcceleration();

    this.hp = this.maxHp;
  }

  applyTemplate(tank, gun) {
    var template;
    if (typeof tank == 'string' && typeof gun == 'string') {
      delete require.cache[require.resolve(tank)];
      delete require.cache[require.resolve(gun)];
      template = require(tank);
      template.gun = require(gun);
    }
    else if (typeof tank == 'object') {
      template = tank;
    }
    else {
      console.log("WARNING: Tank.applyTemplate called with invalid args");
      return;
    }
    let rotation = this.tower ? this.tower.rotation : 0;
    this.tower = JSON.parse(JSON.stringify(template.tower));
    this.tower.rotation = rotation;
    this.color = template.color;
    this.maxSpeed = template.maxSpeed;
    this.engineBraking = template.engineBraking;
    this.accelerationBoost = template.accelerationBoost;
    this.rotationBoost = template.rotationBoost;
    this.brakeForce = template.brakeForce;

    this.maxHp = template.hp;

    this.gun = JSON.parse(JSON.stringify(template.gun));
  }

  reactToKeyboard(keyboard, dt) {
    let kb = keyboard.now;
    let was = keyboard.previous;
    let ret = {shoot: false}

    if (kb == undefined) return ret;
    if (was == undefined) was = kb;
    if (kb['w']) this.accelerate(1 * dt);
    if (kb['s']) this.accelerate(-1 * dt);
    if (kb['a']) this.turn(-1 * dt);
    if (kb['d']) this.turn(1 * dt);
    if (kb['left']) this.rotateTower(-1 * dt);
    if (kb['right']) this.rotateTower(1 * dt);
    if (kb['up'] && !was['up']) ret.shoot = true;

    return ret;
  }

  update(dt) {
    if (!this.accelerated) {
      if (this.speed > 0) {
        this.speed -= this.engineBraking;
        if (this.speed < 0) this.speed = 0;
      }
      else if (this.speed < 0) {
        this.speed += this.engineBraking;
        if (this.speed > 0) this.speed = 0;
      }
    }
    this.accelerated = false;
    
    let dx = Math.cos(this.body.angle);
    let dy = Math.sin(this.body.angle);
    let vx = dx * this.speed;
    let vy = dy * this.speed;
    this.move(vx * dt, vy * dt);
  }

  accelerate(dir) {
    if (dir * this.speed < 0) {
      this.speed += this.brakeForce * dir;  
      if (dir * this.speed > 0) this.speed = 0;
    } else {
      this.speed += this.acceleration * dir;
      if (dir > 0) this.speed = Math.min(this.speed, this.maxSpeed);
      else if (dir < 0) this.speed = Math.max(this.speed, -this.maxSpeed);
    }
    this.adjustAcceleration();
    this.accelerated = true;
  }

  adjustAcceleration() {
    let velocity = Math.abs(this.speed);
    this.acceleration = (10000 / (velocity + 50)) * this.accelerationBoost;
    this.rotationSpeed = (1200 / (velocity + 200)) * this.rotationBoost;
  }

  turn(dir) {
    this.rotate(this.rotationSpeed * dir);
  }

  rotateTower(dir) {
    this.tower.rotation += this.tower.rotationSpeed * dir;
  }
}

module.exports.Tank = Tank;