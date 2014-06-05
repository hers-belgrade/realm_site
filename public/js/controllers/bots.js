function Distincter(resarray){
  if(!resarray){return;}
  this.map = {};
  this.push = function(value){
    resarray.push(value);
  };
  this.pop = function(value){
    var index;
    for(var i in resarray){
      if(this.compare(resarray[i]===value)){
        index=i;
        break;
      }
    }
    if(typeof index!=='undefined'){
      resarray.splice(index,1);
    }
  };
};
Distincter.prototype.compare = function(storedval,providedval){
  return storedval===providedval;
};
Distincter.prototype.add = function(value){
  if(!this.map[value]){
    this.push(value);
    this.map[value]=0;
  }
  this.map[value]++;
};
Distincter.prototype.remove = function(value){
  if(!this.map[value]){
    return;
  }
  this.map[value]--;
  if(this.map[value]<1){
    delete this.map[value];
    this.pop(value);
  }
};

function SelectOptionDistincter(resarray){
  if(!resarray){return;}
  Distincter.prototype.constructor.call(this,resarray);
  var origpush = this.push;
  this.push = function(value){
    origpush({name:value,value:value});
    resarray.sort(function(a,b){if(a.name>b.name){return 1;}if(a.name<b.name){return -1;}return 0;});
  }
};
SelectOptionDistincter.prototype = new Distincter();
SelectOptionDistincter.prototype.constructor = SelectOptionDistincter;
SelectOptionDistincter.prototype.compare = function(storedval,providedval){
  return storedval && providedval && (storedval.name===providedval.name);
}

function handleBot(bot,follower,scope){
  function handleBotField(fieldname){
    follower.listenToScalar(bot,fieldname,{setter:function(val,oldval){
      this[fieldname]=val;
    }});
  };
  handleBotField('rooms');
  handleBotField('policy');
  handleBotField('balance');
  //handleBotField('roomname');
  //handleBotField('status');
  //handleBotField('balance');
  //handleBotField('chips');
  //handleBotField('lastActivity');
  //handleBotField('lastAnswer');
};

angular.module('mean.bots').controller('BotsController', ['$scope', 'Bots', 'follower', function($scope,Bots,follower) {
	
  $scope.bots = [];
  $scope.display_data = [];
  $scope.pagingOptions = {
    pageSizes: [5,10,20, 50, 100], 
    pageSize: 5,
    currentPage: 1
  };

  $scope.$watch('pagingOptions', function (newVal, oldVal) {
    if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage) || (newVal.pageSize !== oldVal.pageSize)) {
      $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    }
  }, true);
  $scope.$watch('bots.length', function (nv, ov) {
    $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
  }, true);
  $scope.getPagedData = function (size, current) {
    var start = (current - 1)*size;
    if (start > this.bots.length) {
      while ((current - 1)*size > this.bots.length && current > 1) {
        current--;
      }
      $scope.pagingOptions.currentPage = current;
      return;
    }

    this.display_data = this.bots.slice((current-1)*size, current*size)
  }

  $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);


	$scope.gridOptions = {
		enableRowSelection: false,
    enablePaging:true,
    enableCellEdit:true,
    rowHeight: 50,
    multiSelect: false,
    showFooter:true,
		data:'display_data',
    totalServerItems: 'bots.length',
    pagingOptions: $scope.pagingOptions,
		columnDefs: [
     {field:'username', displayName:'Name'},
     {field:'avatar', displayName:'Avatar', cellTemplate:'<div class="ngCellText" ng-class="col.colIndex()"><img src="/img/avatars/{{row.getProperty(col.field)}}" width="60px"/></div>'},//cellTemplate:'<img src="/img/avatars/{{_bot.avatar}}" width="60px"/>'},
     {field:'rooms', displayName:'Sitting in Rooms'},
     {field:'balance', displayName:'Money Engaged'},
     {field:'policy', displayName:'Policy'}/*,
     {field:'balance',displayName:'Balance'},
     {field:'lastActivity', displayName:'Last activity',cellFilter:'date'},
     {field:'lastAnswer', displayName:'Last answer',cellFilter:'date'},
     {field:'_any', displayName:'Actions', cellTemplate:'<div class="ngCellText" ng-class="col.colIndex() "><div class="hidden-phone visible-desktop action-buttons ngCellText" ng-class="col.colIndex() "><a data-ng-click="set(bots[row.rowIndex],$event)" class="green"><i class="icon-pencil bigger-130"></i></a><a href="#" class="red"><i class="icon-trash bigger-130"></i></a></div></div>'}//cellTemplate:'<div class="ngCellText" ng-class="col.colIndex() "><div ng-cell-text ng-click="console.log(row.rowIndex)" data-toggle="modal">Edit</div></div>'}
    */
    ]

		
	};

  $scope.setup = {};
  function getBotOrdinal (botname){
    for(var i in $scope.bots){
      if($scope.bots[i].username===botname){
        return i;
      }
    }
  };

  function getOrCreateBot (botname){
    var bo = getBotOrdinal(botname);
    if(typeof bo === 'undefined'){
      var bot = {username:botname};
      $scope.bots.push(bot);
      return bot;
    }else{
      return $scope.bots[bo];
    }
  };

  $scope.list = function(){
    follower.do_command(':activate','botsFollower');
    Bots.query(function(bots){
      for(var i in bots){
        var bot = getOrCreateBot(bots[i].username);
        bot.avatar = bots[i].avatar;
      }
      //$scope.bots = bots;
    });
  };
  $scope.load = function(name){
    Bots.get({name:name},function(bot){
      $scope.bot = bot;
    });
  };
  $scope.save = function(){
    var bot = new Bots(this.bot);
    bot.$save(function(response){
      console.log(response);
      $scope.list();
    });
  };
  $scope.set = function(b){
    $scope.bot = b;
    $scope.setup.editable = true;
  };
  $scope.needNew = function(){
    $scope.bot = {};
    $scope.setup.editable = true;
  };


  $scope.listeners = {};
  $scope.rooms = [{name:'All',value:''}];
  $scope.botparams = {};
  follower.follow('bots').listenToScalars($scope.botparams,{setter:function(name,val){
    if(typeof val === 'undefined'){
      delete this[name];
    }else{
      this[name] = val;
    }
  }});
  follower.follow('bots').listenToCollection($scope,'bots',{activator:function(){
    var botf = follower.follow('bots').follow('bots');
    this.listeners.bots = botf.listenToCollections(this,{activator:function(botname){
      var bot = getOrCreateBot(botname);
      handleBot(bot,botf.follow(botname),this);
    },deactivator:function(botname){
      var bo = getBotOrdinal(botname);
      if(typeof bo !== 'undefined'){
        this.bots.splice(bo,1);
        botf.follow(botname).destroy();
      }
    }});
  }});
  $scope.setSwarmParams = function(){
    follower.do_command(':commitTransaction',{txnalias:'botcount_change',txns:[
      ['set',['local','bots','botcount'],[this.botparams.botcount]],
      ['set',['local','bots','leavefactor'],[this.botparams.leavefactor]]
    ]});
    //follower.do_command('/local/bots/pokerbots/setSwarmParams',this.botparams);
  };
  $scope.$on('$destroy',function(event){
    follower.do_command(':deactivate','botsFollower');
    for(var i in event.currentScope.listeners){
      event.currentScope.listeners[i].destroy();
    }
    $scope.bots = [];
  });
  $scope.editable = false;

}]);
