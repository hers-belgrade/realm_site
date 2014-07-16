angular.module('mean.system').controller('SystemController', ['$scope', 'follower', function($scope,follower){
  $scope.system = {};
  follower.listenToCollection($scope,'system',{activator:function(){
    follower.follow('system').listenToScalars(this,{setter:function(name,val,oldval){
      if(typeof val !== 'undefined'){
        this[name] = val;
      }else{
        delete this[name];
      }
    }});
  }});
}]);
