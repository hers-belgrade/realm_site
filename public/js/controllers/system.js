angular.module('mean.system').controller('SystemController', ['$scope', 'follower', 'historize', function($scope,follower,historize){
  $scope.system = {};
  $scope.systemhistory = {};
  $scope.systemtrend = {};
  follower.listenToCollection($scope,'system',{activator:function(){
    follower.follow('system').listenToScalars(this,{setter:function(name,val,oldval){
      historize(this.system,this.systemhistory,this.systemtrend,name,val,name==='CPU'?20:50);
    }});
  }});
}]);
