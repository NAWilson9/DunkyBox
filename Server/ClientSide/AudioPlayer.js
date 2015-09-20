/**
 * Created by cmbranc on 9/19/15.
 */

var GLOBAL_ROOMNAME = '';
var songLoaded = false;

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        /*  height: '480',
         width: '853',
         */
        height: '0',
        width: '0',
        videoId: 'fzirfZMWHyo',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    updateState();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    updateState();
    updateTitle();
    if (getVideoState() === -1) {
        document.getElementById('error').innerHTML = "This video cannot be played unless you are on Youtube.com";
    }
    else {
        document.getElementById('error').innerHTML = "";
    }

    if (getVideoState() === 0) {
        console.log('here')
        playNext();
    }
}
function playVideo() {
    if(songLoaded){
        player.playVideo();
        songLoaded = true;
    }
    else{
        playNext();
    }
}
function pauseVideo() {
    player.pauseVideo();
}
function getVideoState() {
    return player.getPlayerState();
}
function loadYTLink() {
    var id = parseURL(getYTLink());
    GLOBAL_ROOMNAME = getRoomName();
    if (id.length) {
        player.loadVideoById(id, 0, "large");
    }
}
function loadYTID(id){
    if (id.length) {
        player.loadVideoById(id, 0, "large");
    }
}
function playNext() {
    socket.emit('popSong', GLOBAL_ROOMNAME);
}
function updateTitle() {
    document.getElementById("title").innerHTML = player.getVideoData().title;
}
function updateNextTrackDisplay() {
    if (queue.length) {
        document.getElementById("nextTrack").innerHTML = queue[0];
    }
    else {
        document.getElementById("nextTrack").innerHTML = "None";
    }
}
function parseYoutubeURL(URL) {
    if (URL !== "") {
        var id = URL.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
        return id[1];
    }
}
function updateState() {
    document.getElementById('state').innerHTML = 'State: ' + getVideoState();
}
function getYTLink() {
    return document.getElementById("YTLinkBox").value;
}
function getRoomName() {
    return document.getElementById("RoomName").value;
}
function diePotato() {
    player.loadVideoById({
        'videoId': 'fzirfZMWHyo',
        'startSeconds': 9,
        'endSeconds': 10,
        'suggestedQuality': 'large'
    });
}
