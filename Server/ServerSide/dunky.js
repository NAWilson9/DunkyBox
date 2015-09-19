/**
 * Created by Nick on 9/18/2015.
 */

//Link dependencies
var express = require('express');
var sockets = require('socket.io');
var fs = require('fs');

//Setup server
var app = express();
var io = sockets();
var server;
var port = 1337;
var serverName = 'DunkyBox';

//Session setup
var rooms = [];
var songData = {
    "roomKeys" : [
        {"key" : "testkey", "queue" : []}
    ]
};

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
    if(!creationData.name){
        console.error('Error: createRoom : No room name specified.');
        return;
    } else if(!creationData.roomJoinPassword){
        console.error('Error: createRoom : No room join password specified.');
        return;
    } else if(!creationData.adminKey){
        console.error('Error: createRoom : No admin key specified.');
        return;
    } else if(!creationData.controlKey){
        console.error('Error: createRoom : No control key specified.');
        return;
    }
    //Checks if a room with the chosen name already exists
    for(var i = 0; i < rooms.length; i++){
        if(rooms[i].name == creationData.name){
            console.error('Error: createRoom : A room with the name \"' + creationData.name + '\" already exists.');
            return;
        }
    }
    var newRoom = {
        'name': creationData.name,
        'roomJoinPassword': creationData.roomJoinPassword,
        'adminKey': creationData.adminKey,
        'controlKey': creationData.controlKey,
        'playlist':[]
    };
    //Adds the room to the rooms array (stores it in memory)
    rooms.push(newRoom);
    //Saves a room as a JSON file in the RoomSessions folder
    fs.writeFile(__dirname + '/RoomSessions/' + room.name + '.json', JSON.stringify(room, null, 4), function(err){
        if(err){
            console.error('Error: saveRoomFile: ' + err);
        }
    })
};

//Deletes the room with the inputted room name
var deleteRoom = function(roomName){
    var deleted = false;
    for(var i = 0; i < rooms.length; i++){
          if(rooms[i].name == roomName){
              rooms.splice(i, 1);
              deleted = true;
          }
    }
    if(!deleted){
        console.error("Error: deleteRoom: No room found with the room name \"" + roomName + "\".");
        return;
    }
    //Deletes the JSON file corresponding to the inputted room name
    fs.unlink(__dirname + '/RoomSessions/' + roomName + '.json', function(err){
        if(err){
            console.error('Error: deleteRoom: ' + err);
        }
    })
};

//Updates room data
var updateRoom = function(roomName, roomData){
    var updated = false;
    for(var i = 0; i < rooms.length; i++){
        if(rooms[i].roomName == roomName){
            rooms[i] == roomData;
        }
    }
};

//Reads a room from it's json file and returns it in an object
var readRoomFile = function(roomName){
    fs.readFile('/RoomSessions/' + roomName + '.json', function(err, data){
        if(err){
            console.log(err);
        } else {
            return data;
        }
    })
};

//Changes the guest password of the inputted roomName
var changeRoomPassword = function(roomName, roomPassword){
    for(var i = 0; i < rooms.length; i++){
        if(rooms[i].roomName == roomName){
            rooms[i].roomPassword = roomPassword;
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
    console.log('knob');
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
    socket.on('pushSong', function(data){
        songData.roomKeys[0].queue.push(data);
        socket.emit("updateCurList", songData.roomKeys[0].queue.toString());
        console.log('Current list: ' + songData.roomKeys[0].queue.toString());
    });

    socket.on('popSong', function(){

        // if(songData.roomKeys[0].queue.length) {
        socket.emit("returnSong", songData.roomKeys[0].queue.shift());
        socket.emit("updateCurList", songData.roomKeys[0].queue.toString());
        console.log('Current list: ' + songData.roomKeys[0].queue.toString());
        /* }
         else{
         console.log('List empty!')
         }*/
    });

    socket.on('nickCity', function(data){
        console.log(data);
    });

    //Host has requested to create a room
    socket.on('createRoom', function(data){
        if(!data){
            console.error('Error: Improper data provided for room creation.');
            //Todo Return error to host
        } else {
            createRoom(data);
            //Todo return confirmation?
        }
    });

    socket.on('testRoom', function(data){
        console.log(JSON.stringify(rooms));
    });

    socket.on('deleteRoom', function(data){
        if(!data || !data.length){
            console.log('Error: Improper data provided for room deletion.');
            //Todo Return error to host
        }
        deleteRoom(data);
        //Todo return confirmation?
    });

    socket.on('changeRoomPassword', function(data){
        if(!dagta || !data.length){
            console.log("Error: Improper data provided for room password change.");
            //Todo Return error to host
        }
        changeRoomPassword(data.roomName, data.roomPassword);
    });

    //A user has disconnected
    socket.on('disconnect', function (data) {
        console.log(new Date().toLocaleTimeString() + ' | A user has disconnected. Total users: ' + io.engine.clientsCount);
    });
});