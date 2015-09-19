/**
 * Created by Nick on 9/18/2015.
 */

    var pushSong = function () {
        var link = document.getElementById('hype1').value;
        if (link.length)
            socket.emit('pushSong', link);
    };

var popSong = function () {
    socket.emit('popSong');
};

socket.on('returnSong', function (data) {
    if (data.length) {
        console.log(data);
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

var testerino = function(){
    var room = {
        'name': document.getElementById('hypea').value,
        'roomJoinPassword': document.getElementById('hypeb').value,
        'adminKey': document.getElementById('hypec').value,
        'controlKey': document.getElementById('hyped').value
    };
    socket.emit('createRoom', room);
};

var test = function(){
    socket.emit('testRoom');
};

var deleteTest = function(){
    socket.emit('deleteRoom', document.getElementById('hypea').value);
};
