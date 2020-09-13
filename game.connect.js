var Wall = require('./wall').Wall;

module.exports = function extend(Game) {
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
        name: t.name,
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
        hpFraction: t.getHpFraction(),
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