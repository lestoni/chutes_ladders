'use strict'

// Class To Represent Player
// I mean what's a game without a player
module.exports =  class Player {
  constructor(name) {

    this.name = name;
    this.dice = 1;
    this.counter = 0;
  }

  // Roll Dice to a value
  rollDice() {
    this.dice = Math.ceil(Math.random() * (1 - 6) + 6);
    this.counter++;
    return this.dice
  }
}
