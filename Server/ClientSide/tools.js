/**
 * Created by Nick on 9/18/2015.
 */
(function(){
    socket.on('createRoomHandler', function(data){
        document.getElementById('1').innerHTML = data.name;
        document.getElementById('2').innerHTML = data.roomJoinPassword;
        document.getElementById('3').innerHTML = data.adminKey;
        document.getElementById('4').innerHTML = data.controlKey;
        console.log(JSON.stringify(data));
    });


    socket.on('returnSong', function (data) {
        if (data.length) {
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

var testerino = function(){
    socket.emit('createRoom', document.getElementById('hypea').value);
};

var test = function(){
    socket.emit('testRoom');
};

var deleteTest = function(){
    socket.emit('deleteRoom', document.getElementById('hypea').value);
};

var pushSong = function () {
    var link = document.getElementById('YTLinkBox').value;
    document.getElementById('YTLinkBox').value = '';
    var roomname = document.getElementById("RoomName").value;
    var id = parseYoutubeURL(link);
    if (link.length && roomname.length)
        socket.emit('pushSong', {
            "id" : id,
            "roomName" : roomname
        });
};

var popSong = function () {
    var roomName = document.getElementById("RoomName").value;
    if(roomName.length){
        socket.emit('popSong');
    }
};

