var Entity = require('./entity').Entity;

class Wall extends Entity {
  constructor(x, y, points, angle, color_hex="#000000") {
    super(x, y, points, angle, 'wall');
    this.color = color_hex;
  }
}


module.exports.Wall = Wall;