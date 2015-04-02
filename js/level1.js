var map;
var layer;
var obstacles;

var Dr_Snake;
var Dr_Liquid;
var GENOME_Interns = [];
var GI1;

var keys;
var action;

var pathfinder;
var statText;

//TODO:
//Create Dr_Liquid, movement, and scripts
//Create GENOME_Interns, patrols, and pathfinding scripts.
//Text popups for actions
//Music?

var Main_state = {
	preload: function(){
//		this.game.load.image('TILESETKEY', 'assets/Level/Map1.png');
//		this.game.load.tilemap('TILEMAPKEY', 'assets/Level/level.json', null, Phaser.Tilemap.TILED_JSON);
//		this.game.load.atlasJSONArray('actors', 'assets/main_spritesheet.png', 'assets/main_spritesheet.jsona');
	},
	
	create: function(){		
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
 
		this.game.world.setBounds(0, 0, 768, 960);
		map = this.game.add.tilemap('TILEMAPKEY');
		map.addTilesetImage('Map1', 'TILESETKEY');
		
		layer = map.createLayer('Layer1');
		layer.smoothed = false;

		map.setCollisionBetween(15, 37);
		
		Dr_Snake = new Snake(this.game);

		var patrol = [[600, 50],
					  [600, 100],
					  [750, 50],
					  [750, 100]];
					  
		GI1 = new GI(this.game, patrol, tilemapTo2DArray(map));
		GENOME_Interns[0] = GI1;
		keys = this.game.input.keyboard.createCursorKeys();
		action = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		
		this.game.camera.follow(Dr_Snake);
		
//		statText = this.game.add.text(416, 16, 'Destination X: 600 Y: 100 \n Patrol_Point: 1', { fontSize: '20px', fill: '#F00' });
	},
	
	update: function(){
		this.game.physics.arcade.collide(Dr_Snake, layer);
		this.game.physics.arcade.collide(GI1, layer);
		this.game.physics.arcade.collide(GI1, Dr_Snake);
		
		Dr_Snake.body.velocity.y = 0;
		Dr_Snake.body.velocity.x = 0;
		
		if(keys.up.isDown){
			Dr_Snake.body.velocity.y = -50;
			Dr_Snake.animations.play('Walk_B');
		}
		else if(keys.down.isDown){
			Dr_Snake.body.velocity.y = 50;
			Dr_Snake.animations.play('Walk_F');
		}
		else if(keys.left.isDown){
			if(Dr_Snake.scale.x == 1.2){
				Dr_Snake.scale.x = -1.2;
			}
			Dr_Snake.body.velocity.x = -50;
			Dr_Snake.animations.play('Walk_LR');
		}
		else if(keys.right.isDown){
			if(Dr_Snake.scale.x == -1.2){
				Dr_Snake.scale.x = 1.2;
			}
			Dr_Snake.body.velocity.x = 50;
			Dr_Snake.animations.play('Walk_LR');
		}
		else{
			Dr_Snake.animations.stop();
		}
		
/*		statText.text = 'Destination X: ' + GI1.dest[0] + ' Y: '+GI1.dest[1] + '\n'+'Patrol Point: '+GI1.patrol_point;
		statText.text += '\nX: pxls: '+(GI1.x);
		statText.text += '\nY: pxls: '+(GI1.y);
//		statText.text += '\nx_dif pxls: '+(GI1.dest[0] - GI1.x);
//		statText.text += '\ny_dif pxls: '+(GI1.dest[1]- GI1.y);
		statText.text += '\nout_x_dif: '+(GI1.out_x_dif);
		statText.text += '\nout_y_dif: '+(GI1.out_y_dif);
		statText.text += '\npath_x: '+(GI1.path[0].x);
		statText.text += '\npath_x: '+(GI1.path[0].y);*/
	
	}
};

function tilemapTo2DArray(map){
	var arr = [];
	for(var x = 0; x < map.height; x++){
		arr[x] = [];
		for(var y = 0; y < map.width; y++){
			arr[x][y] = map.layers[0].data[x][y].index;
		}
	}
	return arr;
}