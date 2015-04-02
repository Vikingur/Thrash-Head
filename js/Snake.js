function Snake(game) {

    //  We call the Phaser.Sprite passing in the game reference
    //  We're giving it a random X/Y position here, just for the sake of this demo - you could also pass the x/y in the constructor
    Phaser.Sprite.call(this, game, 658, 32, 'actors');

	this.scale.x = 1.2;
	this.scale.y = 1.2;
	game.physics.enable(this, Phaser.Physics.ARCADE);
	this.smoothed = false;
	this.anchor.setTo(.5, 1);
	this.body.collideWorldBounds = true;
		
	this.animations.add('Walk_LR', Phaser.Animation.generateFrameNames('SWLR', 1, 8, '.png'), 8, true);
	this.animations.add('Walk_F', Phaser.Animation.generateFrameNames('SWF', 1, 12, '.png'), 12, true);
	this.animations.add('Walk_B', Phaser.Animation.generateFrameNames('SWB', 1, 12, '.png'), 12, true);
	this.animations.play("Walk_F");
	
	game.add.existing(this);
};

Snake.prototype = Object.create(Phaser.Sprite.prototype);
Snake.prototype.constructor = Snake;

Snake.prototype.update = function(){
		
};