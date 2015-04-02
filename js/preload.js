function Preload(){};

Preload.prototype = {
	preload: function() {
		this.game.load.image('TILESETKEY', 'assets/Level/Map1.png');
		this.game.load.tilemap('TILEMAPKEY', 'assets/Level/level.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.atlasJSONArray('actors', 'assets/main_spritesheet.png', 'assets/main_spritesheet.jsona');
	},
	create: function() {
		this.game.state.start('Play');
	}
};