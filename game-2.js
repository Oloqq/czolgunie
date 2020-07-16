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
	
	Game.prototype.getWallData = function getWallData() {
    var data = [];
    this.walls.forEach(w=>{
      let d = {
        x: w.body.x,
        y: w.body.y,
        points: w.points,
        angle: w.body.angle,
        color: w.color
      };
      data.push(d);
    });
    return data
  }

  Game.prototype.getInitData = function getInitData() {
    var data = {};

    data.walls = this.getWallData();
    data.tanks = this.getStaticTanksData();

    return data;
  }

  Game.prototype.getStaticTanksData = function getStaticTanksData() {
    var data = {};

    for (let id in this.tanks) {
      let t = this.tanks[id];
      let d = {
        points: t.points,
        color: t.color,
        tower: {
          x: t.tower.x,
          length: t.tower.length,
          width: t.tower.width,
          color: t.tower.color
        },
        gun: {
          length: t.gun.length,
          width: t.gun.width,
          color: t.gun.color
        }
      };
      data[id] = d;
    }

    return data;
  }

  Game.prototype.getUpdateData = function getUpdateData() {
    var data = {};

    data.tanks = {};
    for (let id in this.tanks) {
      let t = this.tanks[id];
      let d = {
        x: t.body.x,
        y: t.body.y,
        angle: t.body.angle,
        towerRotation: t.tower.rotation
      };
      data.tanks[id] = d;
		}
		
		data.projectiles = [];
		for (let i in this.projectiles) {
			let p = this.projectiles[i];
			if (!p.active) continue;
			data.projectiles.push({
				x: p.body.x,
				y: p.body.y,
				radius: p.radius,
				color: p.color,
				angle: p.body.angle
			})
		}

    if (this.wallsChanged) {
      data.walls = this.getWallData();
    }

    return data
  }

	return Game;
}