angular.module('mean.players').controller('PlayersController', ['$scope','follower', 'historize', function($scope,follower,historize){
  $scope.playertotals = {};
  $scope.playertotalhistory = {};
  $scope.playertotaltrend = {};
  follower.listenToCollection($scope,'players',{activator:function(){
    follower.follow('players').listenToScalars(this,{setter:function(name,val,oldval){
      console.log('historizing');
      console.log(this.playertotals,this.playertotalhistory,this.playertotaltrend,name,val);
      historize(this.playertotals,this.playertotalhistory,this.playertotaltrend,name,val);
      /*
      if(typeof val !== 'undefined'){
        this[name] = val;
      }else{
        delete this[name];
      }
      */
    }});
  },deactivator:function(){
    for(var i in this){
      delete this[i];
    }
  }});
}]);
