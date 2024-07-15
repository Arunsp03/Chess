import WebSocket from 'ws';
import { createServer } from 'http';
import { Chess } from 'chess.js'
import { Player } from './player';
import { error } from 'console';
let currentroom:any;
const server=createServer();
const player=new Player()
const wss = new WebSocket.Server({ noServer:true });
//For maintaining rooms and games
let rooms:any={}
let games:any={}
let players:any={}
wss.on('connection', (ws: WebSocket) => {
  //console.log('New client connected');
  player.ws=ws;
  ws.on('message', (message: any) => {
 try {
  let data=JSON.parse(message);
 //  console.log("data",data);
   if(data.type=="Join")
    {
      player.ws=ws;
      
     if(rooms[data.roomid.toString()])
     {
      if(rooms[data.roomid.toString()].length<2 && !(rooms[data.roomid.toString()].includes(player.ws))){
      rooms[data.roomid.toString()].push(player.ws)
      players[data.roomid.toString()].push({"player":data.player,color:"B",gamestatus:"W"});
     // console.log("players", players[data.roomid.toString()]);
   let reciverarray:any[]=[];
   for(let item in rooms)
   {
     if(rooms[item].includes(ws)){
      // console.log("found room ",item);
       
     reciverarray=rooms[item];
     }
     
   }

   reciverarray.forEach(cl=>cl.send(JSON.stringify({"currentPosition":games[currentroom].fen(),"players":players[currentroom]})))
  
  reciverarray=[]
      
      }
      else{
  //      console.log(`this room ${data.roomid} is full`);
    //    console.log(rooms[data.roomid.toString()].length);

      }
     }
     else{
      players[data.roomid.toString()]=[]
      players[data.roomid.toString()].push({"player":data.player,color:"W",gamestatus:"W"});
 //     console.log("players", players[data.roomid.toString()]);
      
      rooms[data.roomid.toString()]=[]
      rooms[data.roomid.toString()].push(player.ws)
      if(games[data.roomid.toString()])
      {
     //   console.log("game already there");
        
      }
      else{
        let room_chess:any=new Chess()
        games[data.roomid.toString()]=room_chess;
        room_chess=null;
      }
      console.log(rooms[data.roomid.toString()].length);
     }

     for(let item in rooms)
       {
         if(rooms[item].includes(ws)){
     //      console.log("found room ",item);
           currentroom=item;
         
         }
         
       }
    // console.log("current room is",currentroom);
     let reciverarray:any[]=[];
     for(let item in rooms)
     {
       if(rooms[item].includes(ws)){
   //      console.log("found room ",item);
         
       reciverarray=rooms[item];
       }
       
     }
  
     reciverarray.forEach(cl=>cl.send(JSON.stringify({"currentPosition":games[currentroom].fen(),"players":players[currentroom]})))
    // console.log("game in current room",games[currentroom]);
    }

    if(data.type=='Reset')
    {
      console.log("reset hit");
      
      let reciverarray:any[]=[];
      for(let item in rooms)
      {
        if(rooms[item].includes(ws)){
          currentroom=item;
          
        reciverarray=rooms[item];
        }
        
      }
    //  console.log("Game ",players[currentroom][0]["gamestatus"]);
    games[currentroom].reset()
    players[currentroom][0]["gamestatus"]="W"
      reciverarray.forEach(cl=>cl.send(JSON.stringify({"currentPosition":games[currentroom].fen()})))

     // ws.send(JSON.stringify({"currentPosition":chess.fen()}))
     reciverarray=[]
    }
 
   if(data.type=='Move')
    {

      let move=data.piece.toString().replace('w','').replace('b','').replace('W','').replace('B','')+data.target.toString()
      let piece=data.piece.toString();
      
    //  console.log("piece",piece);
      
      //If the piece is pawn then only show target
      for(let item in rooms)
        {
          if(rooms[item].includes(ws)){
        //    console.log("found room ",item);
            currentroom=item;
          
          }
          
        }
    
      if(games[currentroom].get(data.target.toString()) )
      {
        
        move=data.color=='w'?piece.toString().toUpperCase():piece.toString().toLowerCase()+data.source.toString().slice(0,1)+"x"+data.target.toString()

        
        
      }
      else{
        move=piece+data.source.toString().slice(0,1)+"x"+data.target.toString()
      
      }
      let currentturn:string='';
      let isdraw:boolean;
      console.log("turn",data.turn);
      console.log("game status",players[currentroom][0]["gamestatus"]);
      
      
      // console.log("ws",ws);
      if(players[currentroom][0]["gamestatus"]==data.turn)
        {
        
         currentturn= games[currentroom].turn()
            games[currentroom].move({from:data.source,to:data.target})
            // console.log("game status",games[currentroom].isGameOver());
            // console.log("next turn",games[currentroom].turn());
            
            isdraw=games[currentroom].isInsufficientMaterial() || games[currentroom].isDraw()
          // console.log("isdraw",isdraw);
          // console.log("isover",games[currentroom].isGameOver());
          
          
          if(players[currentroom][0]["gamestatus"]=="W")
          {
            players[currentroom][0]["gamestatus"]="B"; 
          }
          else{
            players[currentroom][0]["gamestatus"]="W"; 
          }
           
        }
        else{
          
        }
    
      console.log(games[currentroom].ascii())
      let reciverarray:any[]=[];
      for(let item in rooms)
      {
        if(rooms[item].includes(ws)){
       //   console.log("found room ",item);
          
        reciverarray=rooms[item];
        }
        
      }
    //  console.log("Game ",players[currentroom][0]["gamestatus"]);

      reciverarray.forEach(cl=>cl.send(JSON.stringify({"currentPosition":games[currentroom].fen(),"players":players[currentroom],"gamestatus":players[currentroom][0]["gamestatus"],"gameover":games[currentroom].isCheckmate(),"probableWinner":currentturn,"isdraw":isdraw})))

     // ws.send(JSON.stringify({"currentPosition":chess.fen()}))
     reciverarray=[]
    }
    else{
      let reciverarray:any[]=[];
      for(let item in rooms)
      {
        if(rooms[item].includes(ws)){
      //    console.log("found room ",item);
          
        reciverarray=rooms[item];
        }
        
      }
      reciverarray.forEach(cl=>cl.send(JSON.stringify({"currentPosition":games[currentroom].fen(),"players":players[currentroom]})))
     // ws.send(JSON.stringify({"currentPosition":chess.fen()}))
     reciverarray=[]
    }
    }
   catch (error:any) {
    for(let item in rooms)
      {
        if(rooms[item].includes(ws)){
         // console.log("found room ",item);
          currentroom=item;
        
        }
        
      }
  console.log(error.toString());
 // console.log("cuurent room is",currentroom);
  
  //console.log("error in game",games[currentroom].ascii());  
  let reciverarray:any[]=[];
  for(let item in rooms)
  {
    if(rooms[item].includes(ws)){
      //console.log("found room ",item);
      
    reciverarray=rooms[item];
    }
    
  }
  reciverarray.forEach(cl=>cl.send(JSON.stringify({"currentPosition":games[currentroom].fen(),"players":players[currentroom]})))
  }
  });



  ws.on('close', () => {
    for(let item in rooms)
      {
        if(rooms[item].includes(ws)){
       
          
        //  console.log("found room ",item);
          currentroom=item;
         
        }
        
      }
      
    console.log('Client disconnected');
    games[currentroom].reset()
  });
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
  });
});

server.listen(8080);