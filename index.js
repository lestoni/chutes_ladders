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


// Lets work with two players for now
let player = new Player('John');

let stats = {
  solved: 0,
  moves: 0,
  minimum_moves: 0
};

lineReader.on('close', () => {

  for(let board of boards) {
    board = new Board(board);
    averageMoves(board);

  }

  for(let board of boards) {
    board = new Board(board);
    minimumMoves(board);
  }

  // Stats
  console.log('Boards Count: ', boards.length);
  console.log('Solved Boards Count: ', stats.solved);
  console.log('Average Moves Per Board: ', stats.moves / stats.solved)
  console.log('Minimum Moves Per Board: ', stats.minimum_moves / stats.solved)

  // clean exit
  process.exit(0)
})

function minimumMoves(board) {
  let verdict;

  try {
    while(!board.isSolved) {
      let diff = (board.finish - board.currentTile);
      let dice = diff < 6 ? diff : player.rollDice(6);

      verdict = board.moveCounter(dice)

      if(verdict.isSolved) {
        stats.minimum_moves += player.counter;
        player.counter = 0;
      }


    }
  } catch (e) {
    // for any uncaught exception
    console.log(e.message)
  }
}

// calculate Average Moves
function averageMoves(board) {
  let verdict;

  try {
    while(!board.isSolved) {
      let dice = player.rollDice();

      verdict = board.moveCounter(dice)

      if(verdict.isSolved) {
        stats.solved++;
        stats.moves += player.counter;
        player.counter = 0;
      }
    }
  } catch (e) {
    // for any uncaught exception
    console.log(e.message)
  }
}
