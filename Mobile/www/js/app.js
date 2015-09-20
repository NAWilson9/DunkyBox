// Ionic Starter App

var socket;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('DunkyBox', ['ionic']);
app.config(function($ionicConfigProvider) {
  $ionicConfigProvider.tabs.position("top");

  // note that you can also chain configs
});
app.config(function($stateProvider, $urlRouterProvider){
    //$urlRouterProvider.otherwise('/');

    //$stateProvider.state('home', {
    //  url: '/',
    //  templateUrl: 'templates/home.html',
    //  controller: 'homeController'
    //});
  app.room = {
    roomName:'',
    roomPassword:'',
    adminKey:'Insufficient Priviledges',
    moderatorKey:'Insufficient Priviledges',
    playlist:[]
  };
  app.permissions = {
    admin: false,
    mod: false
  };

  $stateProvider.state('player', {
    url: '/player',
    templateUrl: 'templates/playerview.html',
    controller: 'playerController'
  });
  $stateProvider.state('room', {
    url: '/room',
    templateUrl: 'templates/tabs.html',
    abstract: true
  });
  $stateProvider.state('room.create', {
    url: '/create',
    views: {
      'tab-createroom': {
        templateUrl: 'templates/tab-createroom.html',
        controller: 'roomController'
      }
    }
  });
  $stateProvider.state('room.join', {
    url: '/join',
    views: {
      'tab-joinroom': {
        templateUrl: 'templates/tab-joinroom.html',
        controller: 'roomController'
      }
    }
  });
  $stateProvider.state('queue', {
    url: '/queue',
    templateUrl: 'templates/queueview.html',
    controller: 'queueController'
  });
  $stateProvider.state('manage', {
    url: '/manage',
    templateUrl: 'templates/managelist.html',
    controller: 'roomController'
  });
  $urlRouterProvider.otherwise('/room/create');
});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
        StatusBar.styleDefault();
    }

    if(window.plugins && window.plugins.webintent){
        window.plugins.webintent.getExtra(window.plugins.webintent.EXTRA_TEXT,
          function(url) {
            // url is the value of EXTRA_TEXT
            alert('getExtra: ' + url);
            app.addSong(url);
          }, function() {
            // There was no extra supplied.
          }
        );
    }

    // socket bs
    socket = io('http://10.26.41.108:1337');
    socket.emit('nickCity', 'Nick, there\'s a hundred million otha things that i\'d ratha do');

  });
});

app.tracks= [
  {
    title: "BIC BOI",
    artist: "KNOB",
    playing: false,
    albumart: "https://i.scdn.co/image/07c323340e03e25a8e5dd5b9a8ec72b69c50089d"
  },
  {
    title: "Scoot",
    artist: "Le Doot",
    playing: true,
    albumart: "https://i.scdn.co/image/07c323340e03e25a8e5dd5b9a8ec72b69c50089d"
  },
  {
    title: "She's So Unusual",
    artist: "Cyndi Lauper",
    playing: false,
    albumart: "https://i.scdn.co/image/07c323340e03e25a8e5dd5b9a8ec72b69c50089d"
  }
];
app.playingIndex = 1;
app.playing = app.tracks[app.playingIndex];

app.controller('roomController', function($scope, $ionicPopup, $location) {
  $scope.goNext = function(hash){$location.path(hash).replace();
  $scope.$apply();};

  $scope.room = app.room;
  $scope.permissions = app.permissions;

  socket = io('http://10.26.41.108:1337');
  socket.on('becomeModeratorHandler',function(data){
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{
      app.permissions.mod = true;
      $scope.permissions = app.permissions;
      $scope.room = app.room;
      $scope.$apply();
    }
  });

  socket.on('joinRoomHandler',function(data){
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{
      app.room.roomName = data;
      $scope.room = app.room;
      app.permissions.admin = false;
      app.permissions.mod = false;
      $scope.permissions = app.permissions;
      $scope.goNext('/player');
    }
  });

  socket.on('changeRoomAttributeHandler',function(data){
      if(data.message){
      $scope.showAlert(data.message);
    }
    else {
      if (data.attributeType == 'roomPassword') {
        app.room.roomPassword = data.newValue;
        console.log(data.newValue);
        console.log(app.room.roomPassword);
      } else if (data.attributeType == 'moderatorKey') {
        app.room.moderatorKey = data.newValue;
      }
      $scope.room = app.room;
      $scope.$apply();
    }
  });

  socket.on('createRoomHandler', function(data){
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{
      app.room = data;
      app.permissions.admin = true;
      app.permissions.mod = true;
      $scope.room = app.room;
      $scope.permissions = app.permissions;
      $scope.goNext('/manage');
    }
  });

  socket.on('deleteRoomHandler',function(data){
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{
      $scope.goNext('/');
    }
  });

  $scope.becomeModerator = function(name,password,modKey){
    socket.emit('becomeModerator',name,password,modKey);
    app.room.moderatorKey = modKey;
  };

  $scope.joinRoom = function(password){
    socket.emit('joinRoom',password);
    app.room.roomPassword = password;
  };

  $scope.changeRoomAttribute = function(name,key, attributeType){
    socket.emit('changeRoomAttribute',name,key,attributeType);
  };

  $scope.deleteRoom = function(name,key){
    socket.emit('deleteRoom',name,key);
  };

$scope.createRoom = function(name){
  socket.emit('createRoom',name);
};

  $scope.showAlert = function(message) {
    $ionicPopup.alert({
      title: 'Error',
      content: message
    }).then(function(res) {
      console.log('Test Alert Box');
    });
  };

});

app.addSong = function(song){
  socket.emit('addSong',app.room.roomName,app.room.roomPassword,song);
};

app.controller('queueController', function($scope) {

  socket.on('addSongHandler', function(data){
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{

    }
  });
  $scope.addSong = app.addSong;

  socket.on('addSongHandler', function(data){
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{

    }
  });

  $scope.addSong = function(song){
    socket.emit('addSong',app.room.roomName,app.room.roomPassword,song);
  };

  socket.on('removeSongHandler', function(data){
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{

    }
  });

  $scope.removeSong = function(index){
    socket.emit('removeSong',app.room.roomName,app.room.moderatorKey,index);
  };

  socket.on('getSongListHandler',function(data){
    console.log(data);
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{
      $scope.tracks = data;
      $scope.$apply();
    }
  });

  $scope.getSongList = function(amount){
    socket.emit('getSongList',app.room.roomName,app.room.roomPassword,amount);
  };

  $scope.showAlert = function(message) {
    $ionicPopup.alert({
      title: 'Error',
      content: message
    }).then(function(res) {
      console.log('Test Alert Box');
    });
  };
  $scope.getSongList(15);
  $scope.permissions = app.permissions;
});

app.controller('homeController', function($scope){
  //$scope.content = "hey potato";
  $scope.playing = app.playing;
  $scope.playingIndex = app.playingIndex;
  $scope.tracks = app.tracks;
  $scope.removeItem = function(index){
    if(index < app.playingIndex){
      app.playingIndex = app.playingIndex-1;
      $scope.playingIndex = app.playingIndex;
    }
    app.tracks.splice(index,1);
    $scope.tracks = app.tracks;
  };
  $scope.room = app.room;

  $scope.playPause = function(index){
    if(index != app.playingIndex){
      app.tracks[app.playingIndex].playing = false;
      app.tracks[index].playing = true;
      app.playing = app.tracks[index];
      app.playingIndex = index;
      $scope.playing = app.playing;
      $scope.playingIndex = app.playingIndex;
      $scope.tracks = app.tracks;
    }
    else{
      app.tracks[index].playing = !app.tracks[index].playing;
      $scope.tracks = app.tracks;
    }
  };

});

app.controller('playerController', function($scope, $ionicPopup){
  socket.on('removeSongHandler', function(data){
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{

    }
  });
  $scope.permissions = app.permissions;

  $scope.removeSong = function(index){
    socket.emit('removeSong',app.room.roomName,app.room.moderatorKey,index);
  };

  socket.on('getSongListHandler',function(data){
    console.log(JSON.stringify(data));
    if(data.message){
      $scope.showAlert(data.message);
    }
    else{
      $scope.playing = data[0];
      console.log(data.songList);
      $scope.$apply();
    }
  });

  $scope.getSongList = function(amount){
    socket.emit('getSongList',app.room.roomName,app.room.roomPassword,amount);
  };

  $scope.showAlert = function(message) {
    $ionicPopup.alert({
      title: 'Error',
      content: message
    }).then(function(res) {
      console.log('Test Alert Box');
    });
  };
  $scope.getSongList(1);



  $scope.playSong = function(url){
    queue.push(url);
    playNextSong();
  };

    $scope.nextSong = playNextSong;

    $scope.pauseSong = pausePlayback;

    $scope.resumeSong = resumePlayback;

});
