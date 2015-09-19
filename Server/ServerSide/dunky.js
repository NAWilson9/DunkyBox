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
var keyLength = 8;

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
    //Checks that required data is there
    if(!roomData.name){
        console.error('Error: updateRoom : No room name specified.');
        return;
    } else if(!roomData.roomJoinPassword){
        console.error('Error: updateRoom : No room join password specified.');
        return;
    } else if(!roomData.adminKey){
        console.error('Error: updateRoom : No admin key specified.');
        return;
    } else if(!roomData.controlKey){
        console.error('Error: updateRoom : No control key specified.');
        return;
    }
    var updated = false;
    for(var i = 0; i < rooms.length; i++){
        if(rooms[i].name == roomName){
            rooms[i] = roomData;
            updated = true;
        }
    }
    if(!updated){
        console.error("Error: updateRoom: No room found with the room name \"" + roomName + "\".");
        return;
    }
    saveRoomToFile(rooms[i]);
};

//Changes the guest password of the inputted roomName
var changeRoomPassword = function(roomName, changedAttribute, attributeValue){
    for(var i = 0; i < rooms.length; i++){
        if(rooms[i].roomName == roomName){
            switch(changedAttribute) {
                case 'name':
                    rooms[i].name = attributeValue;
                    break;
                case 'roomJoinPassword':
                    rooms[i].roomJoinPassword = attributeValue;
                    break;
                case 'adminKey':
                    rooms[i].adminKey = attributeValue;
                    break;
                case 'controlKey':
                    rooms[i].controlKey = attributeValue;
                    break;
                default:
                    console.error('Error: changeRoomAttribute: Improper attribute type "' + changedAttribute + '".');
                    break;
            }
            saveRoomToFile(rooms[i]);
        } else if(i == rooms.length - 1){
            console.error('Error: changeRoomAttribute: No rooms found with the room name "' + roomName + '".');
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
        console.log('HYPE: ' + data);
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

    //Host has requested to create a room
    socket.on('createRoom', function(data){
        if(!data && !data.length){
            console.error('Error: Improper data provided for room creation.');
            socket.emit('createRoomHandler', {'message':'No data supplied.'});
        } else {
            createRoom(data);
        }
    });

    //Creates a new room with the inputted data
    var createRoom = function(newRoomName, callback){
        //Makes sure room name is valid
        if(!newRoomName || !newRoomName.length){
            console.error('Error: createRoom : No room name specified.');
            socket.emit('createRoomHandler', {'message':'No room name specified.'});
            return;
        }
        //Checks if a room with the chosen name already exists
        for(var i = 0; i < rooms.length; i++){
            if(rooms[i].name == newRoomName){
                console.error('Error: createRoom : A room with the name \"' + newRoomName + '\" already exists.');
                socket.emit('createRoomHandler', {'message':'A room with that name already exists.'});
                return;
            }
        }

        var newRoom = {
            'name': newRoomName,
            'roomJoinPassword': keyGen(),
            'adminKey': keyGen(),
            'controlKey': keyGen(),
            'playlist':[]
        };
        //Adds the room to the rooms array (stores it in memory)
        rooms.push(newRoom);
        //Persists the room to a JSON file
        saveRoomToFile(newRoom);

        delete newRoom.playlist;
        socket.emit('createRoomHandler', newRoom);
    };

    //Saves a room as a JSON file in the RoomSessions folder
    var saveRoomToFile = function(room){
        fs.writeFile(__dirname + '/RoomSessions/' + room.name + '.json', JSON.stringify(room, null, 4), function(err){
            if(err){
                console.error('Error: saveRoomFile: ' + err);
            }
        })
    };

    //Generates a random key and returns it
    var keyGen = function(){
        var key = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i = 0; i < keyLength; i++ ) {
            key += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return key;
    };
});