import {GameModel} from "./gameModel.js"

export class AIModel {
  constructor(
    makeMoveCallback
  ){
    this.makeMoveCallback = makeMoveCallback
  }

  calculateMove(urGame) {
    console.log("calculating ")
    if(urGame.currentPlayer == "black"){ //if i am playing
      var myPossMoves = urGame.allPossibleMoves("black")
      console.log("my poss moves: ", myPossMoves  )

      if(myPossMoves.length > 0){
        var consequencesOfMoves = [];

        for (let i = 0; i < myPossMoves.length; i++) {
          const move = myPossMoves[i];

          consequencesOfMoves.push(urGame.workOutMove(move,"black",false, false))
          
        }

        var bestMoveAndConsequence = [myPossMoves[0],consequencesOfMoves[0]]

        for (let i = 0; i < consequencesOfMoves.length; i++) {
          const consequence = consequencesOfMoves[i];

          if(consequence.some((change)=>change['to']==0)){

            bestMoveAndConsequence = [myPossMoves[i],consequence]
          }
          
        }


        console.log("making a move")
        this.makeMoveCallback(bestMoveAndConsequence[0])
        
      }
    }
  }
}