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
var keyLength = 9;

//Session setup
var rooms = [];

app.use(express.static('../ClientSide/', {
    extensions: ['html'],
    index: 'client.html'
}));

/*
//Re-populates rooms object with pre-existing JSON rooms
var restoreRooms = function(callback){
    var files;
    var total;
    var cb = function(err, data){
        if(err){
            console.error('Error: restoreRooms: ' + err);
        } else {
            files = data;
            total = data.length;
        }
    };
    //Get's the list of files
    fs.readdir(__dirname + '/RoomSessions/', cb);
    //Reads each file and create the object in memory
    if(total > 0){
        for(var i = 0; i < files.length; i++){
            fs.readFile(files[i], function(err, data){
                if(err){
                    console.error('Error: restoreRooms: ' + err);
                } else {
                    rooms.push(data);
                    total--;
                    if(total == 0){
                        callback();
                    }
                }
            })
        }
    }
};
*/

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
    var functions = [];

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
 Websocket stuff
 */
io.on('connection', function (socket) {
    //On connection...
    console.log(new Date().toLocaleTimeString() + ' | A user has connected. IP Address: ' + socket.handshake.address +  ' Total users: ' + io.engine.clientsCount);

    socket.on('testRoom', function(){
        console.log(JSON.stringify(rooms));
    });

    /*var songS = {
        'type': 'soundcloud',
        'id': 'aedh0934y'
    };*/

    //Receives a song object and adds it to the playlist
    socket.on('addSong', function(data){
        var index = getRoomIndex(data.roomName);
        if(index != null){
            rooms[index].playlist.push(data.song);
            saveRoomToFile(rooms[index]);
            socket.emit('addSongHandler', true);
        } else {
            console.error('Error: Improper or no room name specified.');
            socket.emit('addSongHandler', 'Improper or no room name specified.');
        }
    });

    //Removes the first song in the playlist of the room specified
    socket.on('removeSong', function(roomName){
        var index = getRoomIndex(roomName);
        if(index != null){
            rooms[index].playlist.shift();
            saveRoomToFile(rooms[index]);
            socket.emit('removeSongHandler', true);
        } else {
            console.error('Error: Improper or no room name specified.');
            socket.emit('removeSongHandler', 'Improper or no room name specified.');
        }
    });

    //Returns the index to the room with the inputted name
    var getRoomIndex = function(roomName){
        var index;
        for(var i = 0; i < rooms.length; i++){
            if(rooms[i].name === roomName){
                index = i;
                break;
            }
        }
        return index;
    };

    //Endpoint for creating a room with the supplied room name
    socket.on('createRoom', function(roomName){
        if(!roomName && !roomName.length){
            console.error('Error: Improper data provided for room creation.');
            socket.emit('createRoomHandler', {'message': 'No data supplied.'});
        } else {
            createRoom(roomName);
        }
    });

    //Creates a new room with the inputted data
    var createRoom = function(newRoomName){
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
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        for(var i = 0; i < keyLength; i++ ){
            key += possible[Math.floor(Math.random() * possible.length)];
        }
        return key;
    };

    //Endpoint for deleting a room with the supplied room name
    socket.on('deleteRoom', function(roomName){
        if(!roomName || !roomName.length){
            console.error('Error: No room name provided for room deletion.');
            socket.emit('deleteRoomHandler', {'message': 'No room name supplied for room deletion.'});
        } else{
            deleteRoom(roomName);
        }
    });

    //Deletes the room from memory and and the filesystem with the inputted room name
    var deleteRoom = function(roomName){
        for(var i = 0; i < rooms.length; i++){
            if(rooms[i].name == roomName){
                rooms.splice(i, 1);
            } else if(i == rooms.length - 1){
                console.error('Error: deleteRoom: No room with the room name "' + roomName + '" was found.');
                socket.emit('deleteRoomHandler', {'message':'Room was not found.'});
                return;
            }
        }
        //Deletes the JSON file corresponding to the inputted room name
        fs.unlink(__dirname + '/RoomSessions/' + roomName + '.json', function(err){
            if(err){
                console.error('Error: deleteRoom: ' + err);
            } else{
                socket.emit('deleteRoomHandler', true);
            }
        })
    };

    //Changes the specified attribute of the inputted roomName
    var changeRoomAttribute = function(roomName, changedAttribute, attributeValue){
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
    };//Todo

    //A user has disconnected
    socket.on('disconnect', function () {
        console.log(new Date().toLocaleTimeString() + ' | A user has disconnected. Total users: ' + io.engine.clientsCount);
    });
});