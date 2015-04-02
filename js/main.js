function Game(){}

Game.prototype = {
	start: function(){
		var game = new Phaser.Game(400, 300, Phaser.CANVAS, 'game');

		game.state.add('Boot', Boot);
		game.state.add('Preload', Preload);
		game.state.add('Play', Main_state);
		
		game.state.start('Boot');
	}
};

window.onload = function(){
	var game = new Game();
	game.start();
}