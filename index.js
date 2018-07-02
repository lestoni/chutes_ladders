// Load Dependencies
'use strict'

const fs    = require('fs');
const readline = require('readline');

const  Board = require('./board');
const  Player = require('./player');

// Read Data Line By Line
let lineReader = readline.createInterface({
  input: fs.createReadStream('./chutes_and_ladders.txt', 'utf8')
});

// Globals and Defaults
let currentBoard = {
  height: 0,
  width: 0,
  tiles: 0,
  chutes: [],
  ladders: []
};
let newBoard = true;
let boards = [];
let solved = 0;
let moves  = 0;

lineReader.on('line', (line)=> {
  // If Empty Beginning of a new board data
  if (!line) {
    boards.push(currentBoard);

    currentBoard = {
      height: 0,
      width: 0,
      tiles: 0,
      chutes: [],
      ladders: []
    };

    newBoard = true;

  } else {

    // set dimensions for a new board
    if(newBoard) {
      let dimensions = line.split(/\s+/);

      currentBoard.height = +dimensions[0];
      currentBoard.width = +dimensions[1];
      currentBoard.tiles = +dimensions[2];

      newBoard = false;

    } else {
      // add chutes and ladders info to current board
      let item = line.split(/\s+/)
      if(item[0] == 'C') {
        currentBoard.chutes.push({
          top: +item[1],
          bottom: +item[2]
        })
      } else if(item[0] == 'L') {
        currentBoard.ladders.push({
          top: +item[1],
          bottom: +item[2]
        })
      }
    }
  }
});

lineReader.on('close', () => {
  // Lets work with two players for now
  let John = new Player('John');
  let Jane = new Player('Jane');

  for(let board of boards) {
    board = new Board(board);

    let newGame = true;
    let currentPlayer;
    let verdict;

    try {
      while(!board.isSolved) {
        if (newGame) {
          let firstPlayer = firstRoll();

          if(firstPlayer.name == 'John') {
            currentPlayer = John;
            verdict = board.moveCounter(firstPlayer.dice)
          } else if(firstPlayer.name == 'Jane') {
            currentPlayer = Jane;
            verdict = board.moveCounter(firstPlayer.dice)
          }

          newGame = false;
        } else {
          if (verdict.playAgain) {
            verdict = board.moveCounter(currentPlayer.rollDice())
          } else if (verdict.nextPlayer) {
            currentPlayer = currentPlayer.name == 'Jane'? John : Jane;
            verdict = board.moveCounter(currentPlayer.rollDice())
          }
        }

        if(verdict.isSolved) {
          solved++;
          moves += (John.counter + Jane.counter);
          //console.log(currentPlayer.name, ' Won!!', board.currentTile, board.finish);
          John.counter = 0;
          Jane.counter = 0;
        }
      }
    } catch (e) {
      // for any uncaught exception
      console.log(e.message)
    }
  }

  // let Players roll dice until one of the has a higher number than the other
  function firstRoll() {
    let JohnRoll = John.rollDice();
    let JaneRoll = Jane.rollDice();

    if(JohnRoll > JaneRoll) {
      return John;
    } else if (JohnRoll < JaneRoll) {
      return Jane;
    } else {
      return firstRoll()
    }
  }

  // Stats
  console.log('Boards Count: ', boards.length);
  console.log('Solved Boards Count: ', solved);
  console.log('Average Moves Per Board: ', moves / solved)

  // clean exit
  process.exit(0)


})
