/**
 * Created by cmbranc on 9/19/15.
 */



var GLOBAL_ROOMNAME = '';
var songLoaded = false;

//g2g
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'M7lc1UVf-VE',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);
        done = true;
    }
}
function stopVideo() {
    player.stopVideo();
}
function pauseVideo() {
    player.pauseVideo();
}
function playVideo() {
    player.playVideo();
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


function parseYoutubeURL(URL) {
    if (URL !== "") {
        var id = URL.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
        return id[1];
    }
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