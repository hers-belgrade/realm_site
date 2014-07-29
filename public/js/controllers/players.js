var _historylen = 20;
function doValue(hash,historyhash,trendhash,name,value){
  if(typeof value === 'undefined'){
    delete hash[name];
  }else{
    if(!historyhash[name]){
      historyhash[name] = [];
    }
    historyhash[name].push(value);
    if(historyhash[name].length>_historylen){
      historyhash[name].shift();
    }
    for(var i in historyhash){
      if(i===name){continue;}
      if(historyhash[i].length<_historylen){
        historyhash[i].push(historyhash[i][historyhash[i].length-1]);
      }
    }
    if(hash[name]){
      trendhash[name] = ~~((value-hash[name])/hash[name]*100);
    }
    hash[name] = value;
  }
}
angular.module('mean.players').controller('PlayersController', ['$scope','follower', function($scope,follower){
  $scope.playertotals = {};
  $scope.playertotalhistory = {};
  $scope.playertotaltrend = {};
  follower.listenToCollection($scope,'players',{activator:function(){
    follower.follow('players').listenToScalars(this,{setter:function(name,val,oldval){
      doValue(this.playertotals,this.playertotalhistory,this.playertotaltrend,name,val);
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
