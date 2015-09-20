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
  $stateProvider.state('player', {
    url: '/player',
    templateUrl: 'templates/playerview.html',
    controller: 'homeController'
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
        controller: 'homeController'
      }
    }
  });
  $stateProvider.state('room.join', {
    url: '/join',
    views: {
      'tab-joinroom': {
        templateUrl: 'templates/tab-joinroom.html',
        controller: 'homeController'
      }
    }
  });
  $stateProvider.state('queue', {
    url: '/queue',
    templateUrl: 'templates/queueview.html',
    controller: 'homeController'
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

