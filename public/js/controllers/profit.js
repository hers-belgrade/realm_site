function doProfitPer(){
  var $scope = this.$scope, per = this.per, pername = 'profit_per_'+per, follower = this.follower.follow(pername), period = this.period;
  if(!$scope[period][pername]){
    $scope[period][pername] = {};
  }
  var res = $scope[period][pername];
  follower.listenToScalars(res,{setter:function(name,val,oldval){
    if(typeof val !== 'undefined'){
      res[name] = val;
    }else{
      delete res[name];
    }
  }});
}

function doStats(period){
  var $scope = this.$scope, follower = this.follower;
  if(!$scope[period]){
    $scope[period] = {};
  }
  follower.listenToCollection({$scope:$scope,follower:follower,period:period},period,{activator:function(){
    var follower = this.follower.follow(this.period);
    follower.listenToScalar($scope[period],'netprofit',{setter:function(val,oldval){
      this.netprofit = val;
    }});
    follower.listenToCollection({$scope:this.$scope,follower:follower,period:this.period,per:'room'},'profit_per_room',{activator:doProfitPer});
    follower.listenToCollection({$scope:this.$scope,follower:follower,period:this.period,per:'flavor'},'profit_per_flavor',{activator:doProfitPer});
    follower.listenToCollection({$scope:this.$scope,follower:follower,period:this.period,per:'class'},'profit_per_class',{activator:doProfitPer});
  }});
}

function dbStatsHandler(){
  var $scope = this.$scope, follower = this.follower;
  var dbf = follower.follow('dbstats');
  doStats.call({$scope:$scope,follower:dbf},'today');
}


angular.module('mean.system').controller('ProfitController',['$scope','follower',function($scope,follower){
  follower.listenToCollection({$scope:$scope,follower:follower},'dbstats',{activator:dbStatsHandler});
}]);
