GI = function (game, patrol, map) {

    //  We call the Phaser.Sprite passing in the game reference
    //  We're giving it a random X/Y position here, just for the sake of this demo - you could also pass the x/y in the constructor
    Phaser.Sprite.call(this, game, patrol[0][0], patrol[0][1], 'actors');

	this.animations.add('Walk_LR', Phaser.Animation.generateFrameNames('GIWLR', 1, 4, '.png'), 4, true);
	this.animations.add('Walk_F', Phaser.Animation.generateFrameNames('GIWF', 1, 2, '.png'), 2, true);
	this.animations.add('Walk_B', Phaser.Animation.generateFrameNames('GIWB', 1, 2, '.png'), 2, true);
	this.animations.play("Walk_LR");
	
	this.patrol = patrol;
	this.patrol_point = 1;
	this.dest = patrol[0];
	
	this.map = map;
    this.anchor.setTo(0.5, 1);
	game.physics.enable(this, Phaser.Physics.ARCADE);
	this.body.setSize(26, 2, 0, 0);
	this.body.collideWorldBounds = true;
	this.smoothed = false;
	this.scale.x = 1.2;
	this.scale.y = 1.2;
	this.patrol = patrol;
	this.alarm = false;
	this.path = [{x:-1, y:-1}];

	var self = this;
	this.out_x_dif;
	this.out_y_dif;
	this.moveAlongPath = function(path){
		self.path = path;
		//Move to the next tile in the path.
		//Move Y or X first? Based on distance.
		self.body.velocity.x = 0;
		self.body.velocity.y = 0;
		var x_dif = path[0].x*32+16 - self.x - 13.2;
		var y_dif = path[0].y*32 +16 - self.y - 38.4;
		self.out_x_dif = path[0].x*32 + 16;
		self.out_y_dif = path[0].y*32 + 16;
		if(x_dif >= y_dif && Math.abs(x_dif) >= 16){
			//Move side to side
			if(x_dif > 0){
				self.body.velocity.x = 50;
			}
			else{
				self.body.velocity.x = -50;
			}
		}
		//Else move up or down
		else if(Math.abs(y_dif) >= 16){
			if(y_dif > 0){
				self.body.velocity.y = -50;
			}
			else{
				self.body.velocity.y = 50;
			}
		}
		
	};
	
	this.pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
	this.pathfinder.setGrid(map, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 1000);
	this.pathfinder.setCallbackFunction(this.moveAlongPath);
	game.add.existing(this);
};

GI.prototype = Object.create(Phaser.Sprite.prototype);
GI.prototype.constructor = GI;

GI.prototype.update = function(){
	
    //Have the GI follow his patrol until alarm is triggered, then start hunting for Snake
	if(!this.alarm){
		//Find path to next corner on patrol rectangle. Approach it.
		try{
		this.pathfinder.preparePathCalculation([Math.floor(this.body.x/32), Math.floor(this.body.y/32)], [Math.floor(this.dest[0]/32), Math.floor(this.dest[1]/32)]);
		this.pathfinder.calculatePath();
		}
		catch(err){
		//If you've reached it, then start to move to the next point in the patrol route
		if(Math.abs(this.dest[0] - this.x) <= 32 && Math.abs(this.dest[1] - this.y) <= 32){
				this.dest = this.patrol[this.patrol_point];
				this.patrol_point+= 1;
				if(this.patrol_point >= 4){
					this.patrol_point = 0;
				}
			}
		}
	}
	//Explore and look for Snake until alarm expires, then return to normal.
	else{
		
	}
	
	
	//Update animations for current vectors
	if(this.body.velocity.x != 0){
		this.animations.play("Walk_LR");
		if(this.body.velocity.x < 0){
			this.scale.x = -1.2;
		}
		else this.scale.x = 1.2;
	}
	else if(this.body.velocity.y != 0){
		if(this.body.velocity.y < 0){
			this.animations.play("Walk_B");
		}
		else if(this.body.velocity.y > 0){
			this.animations.play("Walk_F");
		}
	}
	
	else this.animations.stop();
};