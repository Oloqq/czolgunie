var Entity = require('./entity').Entity;

const dt = 0.02; //projectile class also has this, dont change just one

class Tank extends Entity {
  constructor(x, y, angle_deg, template) {
    var t = template;
    var pts = [[-t.length/2, - t.width/2], [t.length/2, - t.width/2],
               [t.length/2, t.width/2], [-t.length/2, t.width/2]];
    var angle_rad = angle_deg * Math.PI / 180;

    super(x, y, pts, angle_rad, 'tank');

    this.color = t.color;

    this.tower = JSON.parse(JSON.stringify(t.tower));
    this.tower.rotation = 0;

    //movement
    this.speed = 0;
    this.maxSpeed = t.maxSpeed;
    this.accelerated = false;
    this.engineBraking = t.engineBraking;
    this.acceleration;
    this.rotationSpeed;
    this.accelerationBoost = t.accelerationBoost;
    this.rotationBoost = t.rotationBoost;
    this.adjustAcceleration();
    this.brakeForce = t.brakeForce;

    //gun
    this.gun = JSON.parse(JSON.stringify(t.gun));
  }

  update() {
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
    let vx = dx * this.speed
    let vy = dy * this.speed
    this.move(vx * dt, vy * dt);
  }

  accelerate(dir) {
    if (dir * this.speed < 0) {
      this.speed += this.brakeForce * dir * dt;  
      if (dir * this.speed > 0) this.speed = 0;
    } else {
      this.speed += this.acceleration * dir * dt;
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
    this.rotate(this.rotationSpeed * dir * dt);
  }

  rotateTower(dir) {
    this.tower.rotation += this.tower.rotationSpeed * dir * dt;
  }
}

module.exports.Tank = Tank;