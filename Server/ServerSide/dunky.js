/**
 * Created by Nick on 9/18/2015.
 */

//Link dependencies
var express = require('express');
var sockets = require('socket.io');

//Setup server
var app = express();
var io = sockets();
var server;
var port = 1337;
var serverName = 'DunkyBox';

//Session setup
var rooms = [];

//Todo link your libraries here...
app.use(express.static('../ClientSide/', {
    extensions: ['html'],
    index: 'client.html'
}));

/*
 Server functions
 */
//Todo put your server functions here

//Creates a new room with the inputted data
var createRoom = function(creationData){
    var room = {
        'roomName': creationData.roomName,
        'roomPassword': creationData.password,
        'roomAdmin': creationData.admin,
        'playlist':[]
    };
    rooms.push(push);
};

//Deletes the room with the inputted room name
var deleteRoom = function(roomName){
  for(var i = 0; i < rooms.length; i++){
      if(rooms[i].roomName == roomName){
          rooms.splice(i, 1);
      }
  }
};



//Handles the initial server setup before starting
var initializeServer = function(functions, startServer) {
    if(!functions.length)startServer();
    var progress = 0;
    var completion = functions.length;
    //Callback for each startup method
    var callback = function () {
        progress++;
        if(progress === completion){
            //All setup is finished
            console.log('All setup completed');
            startServer();
        }
    };
    //Invokes all linked functions
    for (var i = 0; i < completion; i++) {
        functions[i](callback);
    }
};

//Starts the server
(function(){
    //Link required startup methods
    var functions = [];//Todo add startup dependent functions here

    //What to do once initialization finishes
    var start = function(){
        //Starts the Express server
        server = app.listen(port, function () {
            //Server started
            console.log(serverName + ' web server running on port ' + port);

            //Start socket server
            io.listen(server);
            console.log(serverName + ' socket server running on port ' + port);
        });
    };
    initializeServer(functions, start);
})();

/*
AJAX Routes
 */
app.get('/someAddress',function(req, res){
    //Todo do something...
});

/*
 Websocket stuff
 */
io.on('connection', function (socket) {
    //On connection...
    console.log(new Date().toLocaleTimeString() + ' | A user has connected. IP Address: ' + socket.handshake.address +  ' Total users: ' + io.engine.clientsCount);

    /*
     ** Socket routes
     */
    socket.on('someAddress', function(data){
        console.log(data);
    });

    //Host has requested to create a room
    socket.on('createRoom', function(data){
        if(!data || !data.length){
            console.log('Error: Improper data provided for room creation.');
            //Todo Return error to server
        }
        createRoom(data);
        //Todo return confirmation?
    });

    socket.on('deleteRoom', function(data){
        if(!data || !data.length){
            console.log('Error: Improper data provided for room deletion.');
            //Todo Return error to server
        }
        deleteRoom(data);
        //Todo return confirmation?
    });

    //A user has disconnected
    socket.on('disconnect', function (data) {
        console.log(new Date().toLocaleTimeString() + ' | A user has disconnected. Total users: ' + io.engine.clientsCount);
    });
});