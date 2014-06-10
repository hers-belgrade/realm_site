angular.module('mean.players').controller('PlayersController', ['$scope','follower', function($scope,follower){
  $scope.playertotals = {};
  follower.listenToCollection($scope.playertotals,'players',{activator:function(){
    console.log('!!');
    follower.follow('players').listenToScalars(this,{setter:function(name,val,oldval){
      if(typeof val !== 'undefined'){
        this[name] = val;
      }else{
        delete this[name];
      }
    }});
  },deactivator:function(){
    for(var i in this){
      delete this[i];
    }
  }});
}]);
