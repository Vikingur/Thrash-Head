var main_menu = function(){};

main_menu.prototype = {
  create: function() {
    this.enterKey = this.game.input.keyboard
        .addKey(Phaser.Keyboard.ENTER);
 
    this.enterKey.onDown.add(this.tweenPlayState, this);
  },
  tweenPlayState: function() {
 
    tweenFadeIn.onComplete.add(function() {
      this.game.state.start('main');
    }, this);
 
    tweenMenuShrink.chain(tweenFadeIn);
    tweenMenuShrink.start();
  }
};