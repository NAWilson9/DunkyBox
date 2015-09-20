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
var roomSessionLocation = '/RoomSessions/';

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

    socket.on('printRooms', function(){
        console.log(JSON.stringify(rooms));
    });

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

    //Returns the index to the room with the inputted name and password
    var getRoomIndex = function(roomName, roomPassword, isAdmin){
        var index = null;
        for(var i = 0; i < rooms.length; i++){
            if(rooms[i].roomName == roomName){
                if(isAdmin){
                    if(rooms[i].adminKey == roomPassword){
                        index = i;
                    } else {
                        console.error('Error: getRoomIndex: Improper admin key, "' + roomPassword + '", supplied for the room "' + roomName +  '".');
                    }
                    break;
                } else {
                    if(rooms[i].roomPassword == roomPassword){
                        index = i;
                    } else {
                        console.error('Error: getRoomIndex: Improper room password, "' + roomPassword + '", supplied for the room "' + roomName +  '".');
                    }
                    break;
                }

            }
        }
        if(index == null){
            console.error('Error: getRoomIndex: No room found with the roomName "' + roomName + '".');
        }  else {
            return index;
        }
    };

    //Saves a room as a JSON file in the RoomSessions folder
    var saveRoomToFile = function(room){
        //Checks if the folder is present and makes it if it's not.
        if (!fs.existsSync(__dirname + roomSessionLocation)){
            fs.mkdirSync(__dirname + roomSessionLocation);
        }
        fs.writeFile(__dirname + roomSessionLocation + room.roomName + '.json', JSON.stringify(room, null, 4), function(err){
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

    //Endpoint for creating a room with the supplied room name
    socket.on('createRoom', function(newRoomName){
        //Makes sure room name is valid
        if(!newRoomName || !newRoomName.length){
            console.error('Error: createRoom : No room name specified.');
            socket.emit('createRoomHandler', {'message':'No room name specified.'});
            return;
        }
        //Checks if a room with the chosen name already exists
        for(var i = 0; i < rooms.length; i++){
            if(rooms[i].roomName == newRoomName){
                console.error('Error: createRoom : A room with the name "' + newRoomName + '" already exists.');
                socket.emit('createRoomHandler', {'message':'A room with the name "' + newRoomName + '" already exists.'});
                return;
            }
        }

        var newRoom = {
            'roomName': newRoomName,
            'roomPassword': keyGen(),
            'adminKey': keyGen(),
            'moderatorKey': keyGen(),
            'playlist':[]
        };
        //Adds the room to the rooms array (stores it in memory)
        rooms.push(newRoom);
        //Persists the room to a JSON file
        saveRoomToFile(newRoom);
        socket.emit('createRoomHandler', newRoom);
    });

    //Endpoint for deleting a room with the supplied room name
    socket.on('deleteRoom', function(roomName, adminKey){
        if(!roomName || !roomName.length){
            console.error('Error: deleteRoom: No room name provided for room deletion.');
            socket.emit('deleteRoomHandler', {'message': 'No room name supplied for room deletion.'});
        } else if (!adminKey || !adminKey.length){
            console.error('Error: deleteRoom: No admin key provided for room deletion.');
            socket.emit('deleteRoomHandler', {'message': 'No admin key supplied for room deletion.'});
        }
        var index = getRoomIndex(roomName, adminKey, true);
        if(index != null){
            //Remove from memory
            rooms.splice(index, 1);
            //Deletes the JSON file corresponding to the inputted room name
            fs.unlink(__dirname + roomSessionLocation + roomName + '.json', function(err){
                if(err){
                    console.error('Error: deleteRoom: ' + err);
                } else{
                    socket.emit('deleteRoomHandler', true);
                }
            })
        } else {
            console.error('Error: deleteRoom: Unable to either find a room with the room name "' + roomName + '" or authenticate with the admin key "' + adminKey + '".');
            socket.emit('deleteRoomHandler', {'message': 'Unable to either find a room with the room name "' + roomName + '" or authenticate with the admin key "' + adminKey + '".'});
        }
    });

    //Endpoint for getting a new key for the desired for the supplied attributeType
    socket.on('changeRoomAttribute', function(roomName, adminKey, attributeType){
        var index = getRoomIndex(roomName, adminKey, true);
        if(index != null){
            var newKey = keyGen();
            switch(attributeType) {
                case 'roomPassword':
                    rooms[index].roomPassword = newKey;
                    break;
                case 'moderatorKey':
                    rooms[index].moderatorKey = newKey;
                    break;
                default:
                    console.error('Error: changeRoomAttribute: Improper attribute type "' + attributeType + '".');
                    socket.emit('changeRoomAttributeHandler', {'message': 'Improper attribute type "' + attributeType + '".'});
                    break;
            }
            saveRoomToFile(rooms[index]);
            socket.emit('changeRoomAttributeHandler', {'result': true, 'attributeType': attributeType, 'newValue': newKey});
        } else{
            console.error('Error: changeRoomAttribute: Unable to either find a room with the room name "' + roomName + '" or authenticate with the admin key "' + adminKey + '".');
            socket.emit('changeRoomAttributeHandler', {'message': 'Unable to either find a room with the room name "' + roomName + '" or authenticate with the admin key "' + adminKey + '".'});
        }
    });

    //Endpoint for determining if the user has the popper credentials for the inputted room name and room password
    socket.on('joinRoom', function(roomPassword){
        var found = false;
        for(var i = 0; i < rooms.length; i++){
            if(rooms[i].roomPassword == roomPassword){
                socket.emit('joinRoomHandler', rooms[i].roomName);
                found = true;
                break;
            }
        }
        if(!found){
            console.error('Error: joinRoom: Unable to find a room with the room password "' + roomPassword + '".');
            socket.emit('joinRoomHandler', {'message': 'Unable to find a room with the room password "' + roomPassword + '".'});
        }
    });

    //Endpoint for attempting to upgrade user permissions to moderator level
    socket.on('becomeModerator', function(roomName, roomPassword, moderatorKey){
        var index = getRoomIndex(roomName, roomPassword);
        if(index != null){
            if(rooms[index].moderatorKey == moderatorKey){
                socket.emit('becomeModeratorHandler', true);
            } else {
                console.error('Error: becomeModerator: Unable to authenticate with the moderatorKey "' + moderatorKey + '".');
                socket.emit('becomeModeratorHandler', {'message': 'Unable to authenticate with the moderatorKey "' + moderatorKey + '".'});
            }
        }
    });

    //A user has disconnected
    socket.on('disconnect', function () {
        console.log(new Date().toLocaleTimeString() + ' | A user has disconnected. Total users: ' + io.engine.clientsCount);
    });
});