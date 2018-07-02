'use strict'
/**
 * Board Class to represent a chute and ladder board
 */
module.exports = class Board {
  constructor(opts) {

    // defaults
    this.height = 0;
    this.width = 0;
    this.tiles = 0;
    this.finish = 0;
    this.chutes = [];
    this.ladders = [];
    this.isSolved = false;
    this.currentTile = 0;

    this._load(opts)
  }

  // Setup Board
  _load(opts) {
    this.height = opts.height;
    this.width = opts.width;
    this.tiles = opts.width * opts.height;
    this.finish = this.tiles;

    for (let ladder of opts.ladders) {
      this.ladders.push(ladder)
    }

    for (let chute of opts.chutes) {
      this.chutes.push(chute)
    }
  }

  // Main function to move across the board
  moveCounter(steps) {
    this.currentTile = this.currentTile + steps;

    // Check if won
    let isWon = this._isWon();
    if(isWon) {
      this.isSolved = true;

      return {
        isSolved: this.isSolved,
        playAgain: false,
        nextPlayer: false,
        currentTile: this.currentTile
      }

    }

    // Check if counter has gone over the dice finishing tile
    let isPastFinish = this._isPastFinish();
    if(isPastFinish.toMove) {
      this.currentTile = this.finish - isPastFinish.moveBack;
      this._move();
    } else {
      this._move();
    }


    // Player plays again if steps equal to six
    // Board Games rules must be respected for sure!!
    if(steps == 6) {
      return {
        isSolved: this.isSolved,
        playAgain: true,
        nextPlayer: false,
        currentTile: this.currentTile
      }
    } else {
      return {
        isSolved: this.isSolved,
        playAgain: false,
        nextPlayer: true,
        currentTile: this.currentTile
      }
    }

  }

  // check if last tile move is the finish
  _isWon() {
    return this.currentTile == this.finish;
  }

  // Move counter across board while checking
  // ladder and chutes on the way
  _move() {
    setImmediate(()=> {
      let isLadderBottom = this._isLadderBottom()
      let isChuteTop = this._isChuteTop()

      if(isLadderBottom.toMove) {
        this.currentTile = isLadderBottom.toTile;
      } else if(isChuteTop.toMove) {
        this.currentTile = isChuteTop.toTile;
      }

      if(!isLadderBottom.toMove && !isChuteTop.toMove) {
        return
      } else {
        this._move();
      }
    })
  }

  // Check if counter is below a ladder
  // Eureka if so!!
  _isLadderBottom() {
    let currentTile = this.currentTile;

    let move = this.ladders.filter((l, i)=> { return l.bottom == currentTile });

    return {
      toMove: !!move.length,
      toTile: move.length ? move[0].top : null
    }
  }

  // Check if counter is on top of a chute
  // Frown face if so!!
  _isChuteTop() {
    let currentTile = this.currentTile;

    let move = this.chutes.filter((l, i)=> { return l.top == currentTile });

    return {
      toMove: !!move.length,
      toTile: move.length ? move[0].bottom : null
    }
  }

  // Check if counter has gone over the finish tile
  // in which case move player those few steps back
  _isPastFinish() {
    return {
      toMove: this.currentTile > this.finish,
      moveBack: this.currentTile - this.finish
    }
  }
}
