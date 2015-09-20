/**
 * Created by cmbranc on 9/19/15.
 */

//var tag = document.createElement('script');
//tag.src = "https://www.youtube.com/iframe_api";
//var firstScriptTag = document.getElementsByTagName('script')[0];
//firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


var queue = [
    //'http://www.youtube.com/watch?v=gvdf5n-zI14',
    //'https://www.youtube.com/watch?v=Cvcc9GRg4wc',
    //'https://api.soundcloud.com/tracks/209374048.json?client_id=41fd4e987be5cc2b550dae26aff9e2b8'
    //'https://api.soundcloud.com/tracks/19462589.json?client_id=41fd4e987be5cc2b550dae26aff9e2b8'
];

// youtube = 0
// soundcloud = 1
var currentSource = 0;
var paused = false;

// youtube
var player;
// sc
var sound;



function pausePlayback(){
    switch(currentSource){
        case 0:
            player.pauseVideo();
            break;
        case 1:
            sound.pause();
            break;
        default:
            return;
    }
    paused = true;
}

function resumePlayback(){
    switch(currentSource){
        case 0:
            player.playVideo();
            break;
        case 1:
            sound.play();
            break;
        default:
            return;
    }
    paused = false;
}

function playNextSong(){
  if(queue.length) {
    pausePlayback();
    var next = queue.shift();
    //queue.push(next);// no cycles
    goToNextVideo(next);
  }
  else{
    setTimeout(playNextSong, 400);
  }
}


function onYouTubeIframeAPIReady() {
    console.log('iframe ready');
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        //videoId: 'Cvcc9GRg4wc',
        events: {
            'onReady': function(event) {
                console.log('player ready');
                //event.target.playVideo();
                playNextSong();
            },
            'onStateChange': function(event){
                console.log(event);
                if(event.data == 0){
                    console.log('hi');
                    playNextSong();
                }
            },
            'onError': function(){
                console.error("ERROR", arguments);
            }
        }
    });
    console.log(player);
}



// takes url for youtube or soundcloud
function goToNextVideo(url){
    var target = parseYoutubeURL(url);
    if(target){
        console.log('next video, youtoob');
        currentSource = 0;
        player.loadVideoById(target, 0, 'small');
        player.playVideo();
    }
    else{
        target = parseSoundcloudURL(url);
        if(target){
            console.log('sc', target);
            currentSource = 1;
            SC.stream(target, function (s) {
                sound = s;
                console.log('cb', sound);
                sound.play({
                    onfinish: function () {
                        console.log('finished soundcloud song');
                        // TODO go to next
                        goToNextVideo();
                    }
                });
            });
        }
        else{
            console.error('oops');
        }
    }
}





function parseYoutubeURL(url) {
    if (url !== "") {
        var id = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
        if(id && id.length) {
            console.log(id);
            return id[1];
        }
    }
    return false;
}


function parseSoundcloudURL(url){
    //https://api.soundcloud.com/tracks/209374048.json?client_id=41fd4e987be5cc2b550dae26aff9e2b8
    var id = url.match(/.*soundcloud\.com\/(.*)\/(\d*).*/i);
    console.log(id);
    if(id && id.length && id.length>1){
        return 'https://api.soundcloud.com/'+id[1]+'/'+id[2];
    }
    return false;
}






//Authenticates the user
SC.initialize({
    client_id: '41fd4e987be5cc2b550dae26aff9e2b8'
});



