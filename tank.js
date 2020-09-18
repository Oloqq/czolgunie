var Entity = require('./entity').Entity;

class Tank extends Entity {
  constructor(x, y, angle_deg, tankTemplate, name) {
    var template = require(tankTemplate);
    
    var pts = [[-template.length/2, - template.width/2], [template.length/2, - template.width/2],
               [template.length/2, template.width/2], [-template.length/2, template.width/2]];
    var angle_rad = angle_deg * Math.PI / 180;

    //construct entity
    super(x, y, pts, angle_rad, 'tank');
    this.templateName = tankTemplate;
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
    this.oldPos = {x: x, y: y};

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

  reloadTemplate() {
    this.applyTemplate(this.templateName);
  }

  applyTemplate(tank) {
    var template;
    if (typeof tank == 'string') {
      delete require.cache[require.resolve(tank)];
      template = require(tank);
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

    this.gun = template.gun;
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
    this.oldPos = {x: this.body.x, y: this.body.y};
    this.move(vx * dt, vy * dt);
  }

  preventInPlaceAcceleration() {
    if (Math.abs(this.oldPos.x - this.body.x) < 0.01
     && Math.abs(this.oldPos.y - this.body.y) < 0.01) {
      this.speed = 0;
      this.adjustAcceleration();
    }
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
    this.rotationSpeed = Math.pow(velocity + 700, 2) / 8000000 * this.rotationBoost;
  }

  turn(dir) {
    this.rotate(this.rotationSpeed * dir);
  }

  rotateTower(dir) {
    this.tower.rotation += this.tower.rotationSpeed * dir;
  }
}

module.exports.Tank = Tank;