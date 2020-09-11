import {Polygon} from 'collisions';
import {Circle} from 'collisions';

class Entity {
  constructor(x, y, points, angle_rad, type, hp) {
    if (typeof points == 'number') {
      this.points = [];
      this.radius = points;
      this.body = new Circle(x, y, this.points, angle_rad);
    }
    else if (typeof points == 'object') {
      this.points = points;
      this.radius = undefined;
      this.body = new Polygon(x, y, this.points, angle_rad);
    }  
    this.type = type;
    this.body.entity = this;
  }

  getHpFraction() {
    return this.hp / this.maxHp;
  }

  insertInto(system) {
    system.insert(this.body);
  }

  removeFrom(system) {
    system.remove(this.body);
  }

  move(x, y) {
    this.body.x += x;
    this.body.y += y;
  }

  rotate(angle_rad) {
    this.body.angle += angle_rad;
  }

  rotate_deg(angle_deg) {
    this.rotate(angle_deg * Math.PI / 180);
  }

  setRotation(angle_rad) {
    this.body.angle = angle_rad;
  }

  setRotation_deg(angle_deg) {
    setRotation(angle_deg * Math.PI / 180);
  }
}

module.exports.Entity = Entity;