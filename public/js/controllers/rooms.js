angular.module('mean.system').controller('RoomsController',['$scope','follower',function($scope,follower){
  $scope.classcounts={};
  follower.listenToCollection($scope,'rooms',{activator:function(){
    follower.follow('rooms').listenToScalars(this,{setter:function(name,val,oldval){
      if(typeof val !== 'undefined'){
        this[name] = val;
      }else{
        delete this[name];
      }
    }});
    follower.follow('rooms').listenToCollection(this,'class',{activator:function(){
      this.classcounts = {};
      follower.follow('rooms').follow('class').listenToScalars(this.classcounts,{setter:function(name,val){
        if(typeof val !== 'undefined'){
          this[name] = val;
        }else{
          delete this[name];
        }
      }});
    }});
  }});
}]);
