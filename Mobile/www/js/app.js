// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('dunkyBox', ['ionic']);

var socket;
app.run(function($ionicPlatform,$state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    socket = io('http://10.26.41.108:1337');
    $state.go('home');
  });
});

app.config(['$stateProvider',function($stateProvider){
      $stateProvider.state('home',{
          url:'/home',
          controller:'HomeController',
          templateUrl:'views/home.html'
      })
}]);

app.controller('HomeController',['$scope','USER','$state',function($scope,USER,$state) {
    socket.emit('nickCity', 'Chris is a knoblet supreme');
}]);
