angular.module('HERS').controller('LobbyController',['$scope','follower',function($scope, follower){
  $scope.rooms = {};
  var nf = follower.follow('system').follow('cluster').follow('nodes');
  nf.listenToCollections($scope,{activator:function(name){
    var rf = nf.follow(name).follow('server').follow('rooms');
    rf.listenToCollections(this,{activator:function(name){
      this.rooms[name] = rf.follow(name).scalars;
    },deactivator:function(name){
      delete this.rooms[name];
    }});
  }});
}]);
