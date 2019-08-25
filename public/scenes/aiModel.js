import {GameModel} from "./gameModel.js"

export class AIModel {
  constructor(
    makeMoveCallback
  ){
    this.makeMoveCallback = makeMoveCallback
  }

  // +------+-------+              +------+-------+------+------+
  // |      |       |              |      |       |      |      |
  // |  21  |   22  |  23     16   |  17  |  18   |  19  |  20  |
  // |      |       |              |      |       |      |      |
  // +---------------------+------------------------------------+
  // |      |       |      |       |      |       |      |      |
  // |   12 |   11  |  10  |   9   |  8   |   7   |  6   |  5   |
  // |      |       |      |       |      |       |      |      |
  // +---------------------+------------------------------------+
  // |      |       |              |      |       |      |      |
  // |  13  |   14  |   15     0   |   1  |   2   |   3  |   4  |
  // |      |       |              |      |       |      |      |
  // +------+-------+              +------+-------+------+------+

  heuristicOfGameState(gameState){
    // black is minimiser
    // white is maximiser
    var board = gameState['board']
    var diceRoll = gameState['diceRoll']

    var score = 0;

    score -= board[23].length*2
    score += board[15].length*2
    
    console.log(board)

    if(board[8].length > 0){
      // console.log(board[8],board[8][0])
      if(board[8][0]==="white") score += 2
      else score -= 2
    }

    var blackNearFinish = 0;
    var whiteNearFinish = 0;

    board.slice(9,13).forEach(pos => pos.forEach(piece => {
      if (piece === "black") blackNearFinish++
      else whiteNearFinish++
    }))

    return score
  }

  // expectiminimax(node, depth, isChanceNode) {
  //   if( node == aterminalnode || depth == 0){
  //     return this.heuristicOfGameState(node)
  //   }

  //   if(isChanceNode) {
  //     var a = (
  //       (1 * expectiminimax(child.setDice([0,0,0,0]), depth-1, false)) +
  //       (4 * expectiminimax(child.setDice([1,0,0,0]), depth-1, false)) +
  //       (6 * expectiminimax(child.setDice([2,0,0,0]), depth-1, false)) +
  //       (4 * expectiminimax(child.setDice([3,0,0,0]), depth-1, false)) +
  //       (1 * expectiminimax(child.setDice([4,0,0,0]), depth-1, false))
  //       ) / 16.0
  //     return a
  //   } else{

  //     if(node.currentPlayer === "white"){
  //       // Return value of maximum-valued child node
  //       var a = -99999
  //       foreach child of node
  //           a = min(a, expectiminimax(child, depth-1, true))
  //     }
  //     else if(node.currentPlayer === "black") {
  //       // Return value of minimum-valued child node
  //       let α = 99999
  //       foreach child of node
  //           α = max(α, expectiminimax(child, depth-1, true))
  //     } 
      
  //   }

  //   return α

  // }

  calculateMove(urGame) {
    console.log("calculating ")
    if(urGame.currentPlayer == "black"){ //if i am playing
      console.log("Yanking my turn")
      var gameCopy = new GameModel(
        ()=>{},
        ()=>{},
        ()=>{},
        ()=>{},
        ()=>{},
        ()=>{},
        ()=>{},
        ()=>{},
        ()=>{},
        [],
        [],
        [],
        false,
        undefined,
        urGame.exportGameState()
      )

      var myPossMoves = gameCopy.allPossibleMoves("black")
      gameCopy.acceptInput = true;
      console.log("my poss moves: ", myPossMoves  )

      if(myPossMoves.length > 0){
        var scoreForMoves = [];

        for (let i = 0; i < myPossMoves.length; i++) {
          const move = myPossMoves[i];

          var tempChanges = gameCopy.workOutMove(move,"black",false)

          var tempScore = 0;
          
          console.log("changes of this move: ", move, tempChanges)


          tempChanges.forEach(change => {
            
            if(change['to'] == 8) { //benefit center square
              tempScore += 2
              console.log("center square")
            }
            if([20,22,8].includes(change['to'])){ //benefit extra turn
              tempScore += 1
              console.log("extra turn square")
              
            }
            if(change['to'] == 0){ //taking a piece
              tempScore += (change['from']+2)/7 //benefit taking piece further up the board
              console.log("sending one home")
            }
            if(change['to'] == 23){ //bringing a solider off the board
              tempScore += 1.5
              console.log("bringing a soldier off the board")
            }
            
          })
          console.log("score for this change: ", tempScore)

          console.log("--------------------------------------------")
          


          scoreForMoves.push(
            tempScore
          )
          
        }
        // console.log("moves: ", myPossMoves)

        var bestMoveAndConsequence = [myPossMoves[0],scoreForMoves[0]]

        for (let i = 0; i < scoreForMoves.length; i++) {
          const tempScore = scoreForMoves[i];

          if(tempScore > bestMoveAndConsequence[1]){
            // console.log("updating my best move")
            bestMoveAndConsequence = [myPossMoves[i],tempScore]
          }
          
        }

        // console.log("making this move: ", bestMoveAndConsequence[0])
        this.makeMoveCallback(bestMoveAndConsequence[0])
        
      }
    }
  }
}