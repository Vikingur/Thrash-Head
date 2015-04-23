//Additions made:
//Optional easy difficulty w/ click track
//Basic feedback. The crowd will be distracted and glare at you if you attack off-time, and will eventually boot you out.
//Addressed glitch where enemy could pin player against level borders and freeze him.

var player;
//Make each one a bar
var player_health = 5000;
var enemy;
var enemy_health = 10000;
var cursors;
var attack;
var border;
var music;
var lock = 1;
var lights;
var color = 'G';
var TH_life;
var HD_life;
//The current "thump" in the pattern, not really the current beat because it changes duration
var thump = 0;
var attack_power = 100;
var attacks = [];
var heads = [];
var missed_beats = 0;
var statText;
var curThump = false;
var difficulty;

function checkAttackRhythm(){
	//If the player attacks within a certain time window before or after a thump, it counts as in sync.
	//Keeping a long streak of in-sync attacks without missing one will bump up attack power greatly.
	if(thump == 0){
		return;
	}
	
	var time_til_click = game.time.events.duration;
	var time_since_click  = parseInt(patterns[thump].FIELD1) - game.time.events.duration;
	if(attack.isDown){
		if(!curThump){
			if(time_til_click <= 5 || time_since_click <= 5){
				attack_power = Math.max(500, attack_power*.3);
				missed_beats-=2;	
				if(missed_beats < 0){
					missed_beats = 0;
				}
			}
		//If you headbang off-time, you'll lose favor with the crowd.
		//Screwing up 30 times in a short period will get you kicked out.	
		//Good luck accomplishing it!
		if(time_til_click > 5 && time_since_click > 5){
				missed_beats++;
				if(missed_beats > 10){
					game.state.start('BO');
				}
				attack_power = Math.min(100, attack_power * .7);	
			}
			curThump = !curThump;
		}
	}

	var count = 0;
	for(var x = 0; x < 10; x++){
		heads[x].animations.frame = 0;
		if(count < missed_beats/3){
			heads[x].flipped = true;
			heads[x].animations.frame = x;
			count++;
		}
	}
}

var loading_state = {
	preload: function(){
		//6087ms
		game.load.audio('MenuStart', 'assets/WE_loops/MenuStart.ogg', true);
		//7136ms
		game.load.audio('MenuLoop', 'assets/WE_loops/MenuLoop.ogg', true);
		game.load.image('Title', 'assets/Title.png');
		game.load.image('Instructions', 'assets/Instructions.png');
		
		game.load.atlasJSONArray('moshers', 'assets/masterspritesheet.png', 'assets/masterspritesheet.jsona');
		game.load.image('stage', 'assets/background.png');
		game.load.audio('WorldEaterShort', 'assets/WE_loops/WE_short.ogg');
		game.load.image('TH_life', 'assets/TH_lifebar.png');
		game.load.image('HD_life', 'assets/HD_lifebar.png');
		game.load.spritesheet('lights', 'assets/Lights/Lights.png', 118, 45);
		for(var x  = 1; x< 10; x++){
			var sign = "punch" + x;
			var name = "assets/Attacks/punch" + x + ".ogg";
			attacks [x-1] = game.load.audio(sign, name);
		}
		game.load.audio("click", "assets/metronome.ogg");
		game.load.image('KO', 'assets/Knockout.png');
		game.load.image('WO', 'assets/Wipeout.png');
		game.load.image('TO', 'assets/Timeout.png');
		game.load.spritesheet('heads', 'assets/Heads.png', 32, 32);
		game.load.image('wimp', 'assets/wimp.png');
		game.load.image('thrasher', 'assets/thrasher.png');
		game.load.image('BO', 'assets/BootedOut.png');
	},
	update: function(){
		game.state.start('Opening');
	},
};
var buttone;
var buttonn;
var menu_state = {
	preload: function(){
		
	},
	
	create: function(){
		game.add.audio('MenuStart', 1, false);
		game.add.audio('MenuLoop', 1, true);
		game.sound.play('MenuStart');
		game.add.sprite(0, 0, 'Title');
		game.time.events.add(6087, switchSound);
		
		cursors = game.input.keyboard.createCursorKeys();
		attack = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		buttons = 0;
		
	},
	
	update: function(){
		if(lock == 0 && attack.isDown){
			buttone = game.add.button(0, game.height/2 - 25, 'wimp', function(){
			difficulty = 'easy';
			game.sound.stopAll();
			game.state.start('Play');
		});
		buttonn = game.add.button(200, game.height/2 - 25, 'thrasher', function(){
			difficulty = 'normal';
			game.sound.stopAll();
			game.state.start('Play');
		});
		}
	}
};

function switchSound(){
	game.sound.play('MenuLoop', 1, true);
	var temp = game.add.sprite(0, 0, 'Instructions');
	temp.alpha = .8;
	lock = 0;
}

function switchLights(){
	thump++;
	curThump.thump = thump;
//	curThump.thump = false;

	if(thump >= patterns.length){
		game.state.start('Timeout');
	}
	
	if(color == 'G'){
		for(var x = 0; x < 4; x++){
			lights.children[x].frame = 0;
		}
		color = 'R';
		curThump = false;
	}
	
	else if(color == 'R'){
		for(var x = 0; x < 4; x++){
			lights.children[x].frame = 1;
		}	
		color = 'Y'
		curThump = false;
	}
	
	else if(color == 'Y'){
		for(var x = 0; x < 4; x++){
			lights.children[x].frame = 2;
		}
		color = 'G';
		curThump = false;
	}
	
	if(difficulty == "easy"){
		//Play the metronome tick once.
		music.click.play();
	}
	
	var time_til_click = game.time.events.duration;
	var time_since_click  = parseInt(patterns[thump-1].FIELD1) - time_til_click;
	//Each time the thump changes and you don't catch it, you'll also lose power.
	if(time_til_click > 10 && time_since_click <= 10 && !attack.isDown){
		attack_power = Math.min(100, attack_power * .7);
	}
}

var main_state = {
preload: function(){
	
},

create: function() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
    border = game.add.sprite(0, 240);
	game.physics.enable(border, Phaser.Physics.ARCADE);
	border.scale.set(400, 0);
	border.body.immovable = true;

	game.add.sprite(0, 0, 'stage');
	
	heads[0] = game.add.sprite(19, 170, 'heads');
	heads[0].anchor.setTo(.5, .5);
	heads[1] = game.add.sprite(45, 170, 'heads');
	heads[1].anchor.setTo(.5, .5);
	heads[2] = game.add.sprite(92, 170, 'heads');
	heads[2].anchor.setTo(.5, .5);
	heads[3] = game.add.sprite(130, 175, 'heads');
	heads[3].anchor.setTo(.5, .5);
	heads[4] = game.add.sprite(181, 176, 'heads');
	heads[4].anchor.setTo(.5, .5);
	heads[5] = game.add.sprite(220, 170, 'heads');
	heads[5].anchor.setTo(.5, .5);
	heads[6] = game.add.sprite(261, 166, 'heads');
	heads[6].anchor.setTo(.5, .5);
	heads[7] = game.add.sprite(291, 170, 'heads');
	heads[7].anchor.setTo(.5, .5);
	heads[8] = game.add.sprite(325, 163, 'heads');
	heads[8].anchor.setTo(.5, .5);
	heads[9] = game.add.sprite(368, 170, 'heads');
	heads[9].anchor.setTo(.5, .5);
	
	for(var x = 0; x < 10; x++){
		heads[x].animations.add('flip', [0, x], 0);
//		heads[x].animations.play('flip');
		heads[x].frame = 0;
		heads[x].specialFrame = x;
		heads[x].flipped = false;
	}

	player = game.add.sprite(26, 250, 'moshers');
	player.scale.setTo(2.5, 2.5);
	player.smoothed = false;
	player.anchor.setTo(.5, 1);

	player.animations.add('TH_idle', Phaser.Animation.generateFrameNames('TH_idle_', 1, 2, '.png', 0), 8, true);
	player.animations.add('TH_headbang', Phaser.Animation.generateFrameNames('TH_headbang_', 1, 8, '.png', 0), 30, false);
	player.animations.add('TH_move', Phaser.Animation.generateFrameNames('TH_walk_', 1, 8, '.png', 0), 12, true);
	player.animations.play('TH_idle', 8, true);
	
	game.physics.enable(player, Phaser.Physics.ARCADE);
	player.body.setSize(10, 2, 0, 0);
	player.body.collideWorldBounds = true;

	enemy = game.add.sprite(360, 250, 'moshers');
	enemy.scale.setTo(2.5, 2.5);
	enemy.smoothed  = false;
	enemy.anchor.setTo(.5, 1);
	enemy.animations.add('HD_idle_attack', Phaser.Animation.generateFrameNames('HD_idle_attack_', 1, 10, '.png', 0), 10, true);
	enemy.animations.add('HD_move', Phaser.Animation.generateFrameNames('HD_move_', 1, 10, '.png', 0), 10, true);
	enemy.animations.play('HD_idle_attack', 10, true);
	
	var total = 0;
	for(var x = 0; x < patterns.length; x++){
		total += parseInt(patterns[x].FIELD1);
		game.time.events.add(total, switchLights);
	}
	
	lights = game.add.group();
	lights.create(-10, 18, 'lights');
	lights.create(90, 18, 'lights');
	lights.create(190, 18, 'lights');
	lights.create(290, 18, 'lights');
	lights.alpha = .6;
	lights.scale.setTo(1, 2.5);
	
	TH_life = this.game.add.sprite( 10, 10,'TH_life');
	HD_life = this.game.add.sprite( 265, 10, 'HD_life');
	
	game.physics.enable(enemy, Phaser.Physics.ARCADE);
	enemy.body.setSize(10, 2, 0, 0);
	enemy.body.collideWorldBounds = true;
	
	music = game.add.sound('WorldEaterShort');
	music.play();
	
	for(var x = 0; x < 9; x++){
		attacks[x] = game.add.sound("punch"+x);
	}
	
	music.click = game.add.sound("click");
	
	attacks.cur = 0;
	attacks.max = 9;
	
	cursors = game.input.keyboard.createCursorKeys();
	attack = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	
	game.time.events.start();

	curThump = false;
	},

update: function() {
	if(player_health <= 0){
		player.kill();
		game.state.start('Wipeout');
	}
	if(enemy_health <= 0){
		enemy.kill();
		game.state.start('Knockout');
	}
	
	if(player_health <= 5000){
		player_health+= 2;
	}
	
	if(enemy_health <= 10000){
		enemy_health++;
	}
	if(player.alive && enemy.alive){
	//For TH, adjust the rectangles width
	var TH_prop = (player_health/5000);
	TH_life.scale.setTo(TH_prop, 1);
	//For HD, adjust both width and x value
	var HD_prop = (enemy_health/10000);
	HD_life.scale.setTo(HD_prop, 1);
	HD_life.x = 390-125*(HD_prop);
	
		player.body.velocity.setTo(0, 0);
		//Min y on both is 220
		//Max y on both is 360
		if(player.body.y > enemy.body.y){
			player.bringToTop();
		}
				
		else enemy.bringToTop();
		
		checkAttackRhythm();
		
		if(attack.isDown && player.animations.currentAnim.name != 'TH_headbang'){
			player.animations.play('TH_headbang');
			if(game.physics.arcade.overlap(player, enemy)){
				enemy_health -= attack_power;
				attacks[attacks.cur].play();
				attacks.cur++;
				if(attacks.cur == attacks.max){
					attacks.cur = 0;
				}
				//End current attack noise, if possible.
				//Play next one. At the end of the array, randomize it.
			}
		}
		
		if(game.physics.arcade.overlap(player, enemy)){
			player_health-= 10;
		}
		
		else if(player.animations.currentAnim.name == 'TH_headbang' && player.animations.currentAnim.isFinished || player.animations.currentAnim.name != 'TH_headbang'){
			if(cursors.left.isDown){
				player.body.velocity.x = -75;
				player.scale.setTo(-2.5, 2.5);
				player.animations.play('TH_move');
			}
			else if(cursors.right.isDown){
				player.body.velocity.x = 75;
				player.scale.setTo(2.5, 2.5);
				player.animations.play('TH_move');
			}
		
			if(cursors.up.isDown){
				player.body.velocity.y = -30;
				player.animations.play('TH_move');
			}
			else if(cursors.down.isDown){
				player.body.velocity.y = 30;
				player.animations.play('TH_move');
			}
			
			if(!cursors.down.isDown && !cursors.up.isDown && !cursors.left.isDown && !cursors.right.isDown){
				player.animations.play('TH_idle');
			}
		}
		
		enemy.body.velocity.x = 0;
		enemy.body.velocity.y = 0;
		
		var x_dif = enemy.body.x - player.body.x;
		var y_dif = enemy.body.y - player.body.y;
		
		//Enemy wanders randomly until they get near the player
		if((Math.abs(x_dif) <= 200  && Math.abs(x_dif) >= 20) && Math.abs(y_dif) <= 200){
			if(x_dif > 0){
				enemy.body.velocity.x = -50;
				enemy.scale.setTo(2.5, 2.5);
				enemy.animations.play('HD_move');
			}
			else if(x_dif < 0){
				enemy.body.velocity.x = 50;
				enemy.scale.setTo(-2.5, 2.5);
				enemy.animations.play('HD_move');
			}
			
			if(y_dif > 0){
				enemy.body.velocity.y = -50;
				enemy.animations.play('HD_move');
			}
			else if(y_dif < 0){
				enemy.body.velocity.y = 50;
				enemy.animations.play('HD_move');
			}
			//Keeps enemy from pinning player against walls
			if(enemy.body.x <50){
				enemy.body.velocity.x = 25;
			}
			if(enemy.body.x > 350){
				enemy.body.velocity.x = -25;
			}
			if(enemy.body.y < 190){
				enemy.body.velocity.y = 25;
			}
			if(enemy.body.y > 350){
				enemy.body.velocity.y = -25;
			}
		}
		//If they're close to the player, they go back to standing
		else{
			enemy.animations.play('HD_idle_attack');
		}
	}

	game.physics.arcade.collide(player, border);
	game.physics.arcade.collide(player, enemy);
},
};

var ko_state = {
	preload: function(){
		
	},
	create: function(){
		game.add.image(0, 0, 'KO');
	},
	update: function(){
	
	}
};

var wo_state = {
	preload: function(){

	},
	create: function(){
		game.add.image(0, 0, 'WO');
	},
	update: function(){
	
	}
};

var bo_state = {
	preload: function(){

	},
	create: function(){
		game.add.image(0, 0, 'BO');
	},
	update: function(){
	
	}
}

var to_state = {
	preload: function(){
		
	},
	create: function(){
		game.add.image(0, 0, 'TO');
	},
	update: function(){
		
	}
};

var game = new Phaser.Game(400, 300, Phaser.AUTO, 'game');
game.state.add('Play', main_state);
game.state.add('Opening', menu_state);
game.state.add('Wipeout', wo_state);
game.state.add('Timeout', to_state);
game.state.add('Knockout', ko_state);
game.state.add('Loading', loading_state);
game.state.start('Loading');

var patterns = [
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"667",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"444",
    "FIELD2":""
  },
  {
    "FIELD1":"627",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"627",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"627",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"627",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"627",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"627",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"627",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"627",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"418",
    "FIELD2":""
  },
  {
    "FIELD1":"606",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"606",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"606",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"606",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"606",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"606",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"606",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"606",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"404",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"604",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  },
  {
    "FIELD1":"403",
    "FIELD2":""
  }
]