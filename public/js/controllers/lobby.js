angular.module('HERS').controller('LobbyController',['$scope','follower',function($scope, follower){
  $scope.lobby = {};
  $scope.isActive = function(){
    return follower.scalars && follower.scalars.renderer === 'lobby';
  };
  follower.listenToScalar({$scope:$scope,follower:follower},'renderer',{setter:function(val){
    if (!val || val.length === 0) return;

    var splitted = val.split(':');
    if(splitted[0]==='lobby'){
      
    }else{
      this.$scope.lobby = {};
    }
  }});
  follower.listenToCollection($scope,'casino',{activator:function(){
    follower.follow('casino').listenToCollections(this,{activator:function(name){
      var obj = {};
      follower.follow('casino').follow(name).listenToScalars({$scope:this,obj:obj,name:name},{setter:function(name,val){
        if(typeof val === 'undefined'){
          //removal
          var k = this.$scope.lobby[this.obj.class];
          if(k){
            delete k[name];
          }
          return;
        }
        this.obj[name] = val;
        if(name==='class'){
          if(!this.$scope.lobby[val]){
            this.$scope.lobby[val] = {};
          }
          this.$scope.lobby[val][this.name] = this.obj;
          console.log(name,val,this.$scope.lobby);
        }
      }});
    }});
  },deactivator:function(){
    this.lobby = {};
  }});
}]);
