/**
 * Created by Chris on 9/19/2015.
 */


const API_URLS = Object.freeze({

    // give room creds and song url
    PUSH_SONG: 'pushSong',

    // give admin creds, returned next song
    POP_SONG: 'popSong',

    // room name; returns keys (admin, auth, invite)
    CREATE_ROOM: 'createRoom',

    // room name, admin key
    DELETE_ROOM: 'deleteRoom',

    CHANGE_ROOM_PASSWORD: 'changeRoomPassword'
});

/**
 * @typedef String Credential
 */

/**
 * @typedef Credential AdminCred
 */

/**
 * @typedef Credential ControlCred
 */

/**
 * @typedef Credential InviteCred
 */



/**
 * @param {String} url
 * @param {String} roomName
 * @param {InviteCred} inviteCred
 */
function pushSong(url, roomName, inviteCred){
    // TODO reformat to work with updated node stuff
    var pkg = {
        songUrl: url,
        roomName: roomName,
        inviteKey: inviteCred
    };
    socket.emit(API_URLS.PUSH_SONG, pkg);
}

/**
 * @param {String} roomName
 * @param {ControlCred} controlCred
 */
function popSong(roomName, controlCred){
    // request song pop off of queue
    // TODO reformat
    var pkg = {
        roomName: roomName,
        controlKey: controlCred
    };
    socket.emit(API_URLS.POP_SONG, pkg);
}

/**
 * @param {String} name
 */
function createRoom(name){
    socket.emit(API_URLS.CREATE_ROOM, name);
}


/**
 * @param {String} name
 * @param {AdminCred} adminCred
 */
function deleteRoom(name, adminCred){
    var pkg = {
        roomName: name,
        adminKey: adminCred
    };
    socket.emit(API_URLS.DELETE_ROOM, pkg);
}


    // name, admin, control, invite
var handleRoomCreated,
    // songUrl
    handleSongPopped;

// assign all of the callback handlers
(function(){
    var map = {
        'returnSong': function(data){
            // TODO get the next song out of data
            (handleSongPopped || function(){})(
                'url'
            );
        },
        'updateCurList': function(data){
            // returns string of entire queue??
        },
        'createRoomHandler': function(data){
            (handleRoomCreated || function(){})(
                data.name,
                data.adminKey,
                data.controlKey,
                data.roomJoinPassword
            );
        }
    };
    for(var key in map){
        if(map.hasOwnProperty(key)){
            var val = map[key];
            (function(key, val) {
                socket.on(key, function (data) {
                    if (!data) {
                        console.error('Unexpected response to hook ['+key+'], falsey data returned from server.');
                    }
                    else if (data.message) {
                        // TODO this is gonna break as soon as nick changes the standard *coughcoughwhatstandardcough*
                        console.error('ERROR ['+key+']: '+data.message);
                    }
                    else {
                        val(data);
                    }
                });
            })(key, val);
        }
    }
})();
