
document.addEventListener("DOMContentLoaded", () => {
  function close()
{
  document.getElementById("notifications").style.display="none";

}
  let action = "W";
  const socket = new WebSocket("ws://localhost:8080");

function resetgame()
{
//  console.log("hit reset");
  socket.send(JSON.stringify({
    type: "Reset",
    roomid: sessionStorage.getItem("roomid"),
   
})
); 
document.getElementById("notifications").style.display="none";
//console.log("my turn",sessionStorage.getItem("turn"));
if(sessionStorage.getItem("turn")=="B"){
  sessionStorage.setItem("turn","W");
}
else{
  sessionStorage.setItem("turn","B"); 
}
board1.orientation(sessionStorage.getItem("turn") == "B" ? "black" : "white");
//console.log("now my turn is",sessionStorage.getItem("turn"));
}
  function onDrop(source, target, piece, newPos, oldPos, orientation) {
      socket.send(JSON.stringify({
          type: "Move",
          source: source,
          target: target,
          piece: piece.replace("w", '').replace("b", ''),
          color: piece.slice(0, 1),
          roomid: sessionStorage.getItem("roomid"),
          turn: sessionStorage.getItem("turn")
      }));
  }

  const config = {
      draggable: true,
      dropOffBoard: 'snapback',
      onDrop: onDrop
  };

  let board1 = Chessboard('board1', config);

  socket.onopen = () => {
    document.getElementById("reset-btn").addEventListener("click",resetgame);
    document.getElementById("reset-close").addEventListener("click",close);
      socket.send(JSON.stringify({
          type: "Join",
          roomid: sessionStorage.getItem("roomid"),
          player: sessionStorage.getItem("playername")
      }));
  };

  socket.onmessage = e => {
      let currentPosition = JSON.parse(e.data);
     // console.log("position", currentPosition);

      if (currentPosition.gameover) {
        document.getElementById("notifications").style.display="flex";
        document.getElementById("notifications").style.flexDirection="column";
  
        document.getElementById("message").textContent="Gameover " + (currentPosition.probableWinner == 'b' ? "Black" : "White") + " Won";
        
      } else if (currentPosition.isdraw) {
        document.getElementById("notifications").style.display="flex";
        document.getElementById("notifications").style.flexDirection="column";
        document.getElementById("message").textContent="Draw";
       
      }
 

      if (currentPosition.players && currentPosition.players.length == 2 && !document.getElementById("player1").innerHTML && !document.getElementById("player2").innerHTML) {
          document.getElementById("player1").innerHTML = "You";
          document.getElementById("player2").innerHTML = "Opponent";
      }
      if(currentPosition.players){
      for (let item of currentPosition.players) {
          if (sessionStorage.getItem("playername") == item.player) {
              sessionStorage.setItem("turn", item.color);
          }
      }
    }
    if( currentPosition.players){
      document.getElementById("turn-teller").textContent = currentPosition.players[0]["gamestatus"];
    }
    if(currentPosition.reset==true)
      {
        document.getElementById("notifications").style.display="none";
      }
     // console.log("myturn", sessionStorage.getItem("turn"));

      // Update board position and orientation
      board1.position(currentPosition.currentPosition);
      board1.orientation(sessionStorage.getItem("turn") == "B" ? "black" : "white");
     // console.log("orientation", sessionStorage.getItem("turn") == "B" ? "black" : "white");
  };
  
});
