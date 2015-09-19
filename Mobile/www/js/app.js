// Ionic Starter App

var socket;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('DunkyBox', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'homeController'
    });
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

    // socket bs
    socket = io('http://10.26.41.108:1337');
    socket.emit('nickCity', 'Nick, there\'s a hundred million otha things that i\'d ratha do');

  });
});

app.controller('homeController', function($scope){

  $scope.content = "hey potato";

});

