var Wall = require('./wall').Wall;

module.exports = function extend(Game) {
	Game.prototype.loadMap = function loadMap(name) {
    var map;
    try {
      map = require('./data/maps/'+name+'.json');
    }
    catch(error) {
      console.log('tried to load nonexistent map: ' + name);
      return;
    }

    var newWall;
    var edgeThickness = 20;
    var edgeThickness2 = edgeThickness * 2;
    // construct edges
    //left
    newWall = new Wall(-edgeThickness, -edgeThickness, [[0, 0], [edgeThickness, 0], [edgeThickness, map.height + edgeThickness2], [0, map.height + edgeThickness2]], 0, map.edgeColor);
    newWall.insertInto(this.system);
    this.walls.push(newWall);
    //right
    newWall = new Wall(map.width, -edgeThickness, [[0, 0], [edgeThickness, 0], [edgeThickness, map.height + edgeThickness2], [0, map.height + edgeThickness2]], 0, map.edgeColor);
    newWall.insertInto(this.system);
    this.walls.push(newWall);
    //top
    newWall = new Wall(-edgeThickness, -edgeThickness, [[0, 0], [map.width + edgeThickness2, 0], [map.width + edgeThickness2, edgeThickness], [0, edgeThickness]], 0, map.edgeColor);
    newWall.insertInto(this.system);
    this.walls.push(newWall);
    //bottom
    newWall = new Wall(-edgeThickness, map.height, [[0, 0], [map.width + edgeThickness2, 0], [map.width + edgeThickness2, edgeThickness], [0, edgeThickness]], 0, map.edgeColor);
    newWall.insertInto(this.system);
    this.walls.push(newWall);

    //construct rectangular walls
    let shape = [];
    for (let r of map.rectangles) {
      shape = [[0, 0], [r[0], 0], [r[0],  r[1]], [0,  r[1]]];
      for (let c of r[3]) {
        newWall = new Wall(c[0], c[1], shape, 0, r[2]); // (x, y, points array, angle, color)
        newWall.insertInto(this.system);
        this.walls.push(newWall);
      }
    }

    // construct other walls
    shape = [];
    for (let w of map.walls) {
      shape = w[0];
      for (let c of w[1]) {
        newWall = new Wall(c[0], c[1], shape, w[2], w[3]); // (x, y, points array, angle, color)
        newWall.insertInto(this.system);
        this.walls.push(newWall);
      }
    }
  }
  
	return Game;
}