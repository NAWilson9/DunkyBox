/**
 * Created by Nick on 9/18/2015.
 */
(function(){
    socket.on('createRoomHandler', function(data){
        document.getElementById('1').innerHTML = data.roomName;
        document.getElementById('2').innerHTML = data.roomPassword;
        document.getElementById('3').innerHTML = data.adminKey;
        document.getElementById('4').innerHTML = data.moderatorKey;
        console.log(JSON.stringify(data));
    });
    socket.on('deleteRoomHandler', function(data){
        console.log(JSON.stringify(data));
    });
    socket.on('changeRoomAttributeHandler', function(data){
        console.log(JSON.stringify(data));
    });
    socket.on('joinRoomHandler', function(data){
        console.log(JSON.stringify(data));
    });
    socket.on('becomeModeratorHandler', function(data){
        console.log(JSON.stringify(data));
    });


    socket.on('returnSong', function (data) {
        if (data) {
            loadYTID(data);
            document.getElementById('popped').textContent = 'Last Popped Song: ' + data;
        }
        else {
            document.getElementById('popped').innerHTML = 'Last Popped Song: None. (Empty List)';
        }
    });
    socket.on('updateCurList', function (data) {
        if (data.length) {
            console.log(data);
            document.getElementById('curlist').textContent = 'Current List: ' + data;
        }
        else {
            document.getElementById('curlist').innerHTML = 'Current List: Empty!';
        }
    });
})();

var createRoom = function(){
    socket.emit('createRoom', document.getElementById('hypea').value);
};
var printRooms = function(){
    socket.emit('printRooms');
};
var deleteRoom = function(){
    socket.emit('deleteRoom', document.getElementById('hypea').value, document.getElementById('hypeb').value);
};
var changeRoom = function(type){
    var roomName = document.getElementById('hypea').value;
    var adminKey = document.getElementById('hypeb').value;
    if(type == 'pass'){
        socket.emit('changeRoomAttribute', roomName, adminKey, 'roomPassword');
    } else {
        socket.emit('changeRoomAttribute', roomName, adminKey, 'moderatorKey');
    }
};
var login = function(){
    var roomName = document.getElementById('hypea').value;
    var roomPassword = document.getElementById('hypec').value;
    socket.emit('joinRoom', roomName, roomPassword);
};
var becomeModerator = function(){
    var roomName = document.getElementById('hypea').value;
    var roomPassword = document.getElementById('hypec').value;
    var moderatorKey = document.getElementById('hyped').value;
    socket.emit('becomeModerator', roomName, roomPassword, moderatorKey);
};

var addSong = function () {
    var link = document.getElementById('YTLinkBox').value;
    document.getElementById('YTLinkBox').value = '';
    var roomname = document.getElementById("RoomName").value;
    GLOBAL_ROOMNAME = roomname;
    var id = parseYoutubeURL(link);
    if (link.length && roomname.length)
        var song = {
            'type': 'youtube',
            'id': id
        };
    console.log(JSON.stringify(song));
        socket.emit('addSong', {
            "roomName" : roomname,
            "song": song
        });
};
var removeSong = function () {
    var roomName = document.getElementById("RoomName").value;
    if(roomName.length){
        socket.emit('removeSong',roomName);
    }
};

