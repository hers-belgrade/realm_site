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

function handleBot(bot,follower,roomdistincter){
  function handleBotField(fieldname){
    var rdadder,rdremover;
    if(fieldname==='room'){
      rdadder=function(val){
        if(typeof val!=='undefined' && val.length){
          roomdistincter.add(val);
        }
      };
      rdremover=function(val){
        if(typeof val!=='undefined' && val.length){
          roomdistincter.remove(val);
        }
      };
    }else{
      rdadder=function(){};
      rdremover=function(){};
    }
    follower.listenToScalar(bot,fieldname,{setter:function(val,oldval){
      rdadder(val);
      rdremover(oldval);
      this[fieldname]=val;
    }});
  };
  handleBotField('room');
  handleBotField('status');
  handleBotField('balance');
  handleBotField('chips');
  handleBotField('lastActivity');
  handleBotField('lastAnswer');
};

angular.module('mean.bots').controller('BotsController', ['$scope', 'Bots', 'follower', function($scope,Bots,follower) {

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
    Bots.query(function(bots){
      console.log(bots);
      for(var i in bots){
        var bot = getOrCreateBot(bots[i].username);
        bot.avatar = bots[i].avatar;
      }
      console.log($scope.bots);
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


  this.listeners = {};
  $scope.bots = [];
  $scope.rooms = [{name:'All',value:''}];
  var distincter = new SelectOptionDistincter($scope.rooms);
  $scope.botparams = follower.follow('local').follow('bots').scalars;
  var botf = follower.follow('local').follow('bots').follow('bots');
  this.listeners.bots = botf.listenToCollections($scope.bots,{activator:function(botname){
    var bot = getOrCreateBot(botname);
    handleBot(bot,botf.follow(botname),distincter);
  },deactivator:function(botname){
    var bo = getBotOrdinal(botname);
    if(typeof bo !== 'undefined'){
      this.splice(bo,1);
      botf.follow(botname).destroy();
    }
  }});
  $scope.swarmprefix = '';
  $scope.swarmcount = 0;
  follower.listenToMultiScalars($scope,['botprefix','botcount'],function(hash){
    this.swarmprefix = hash.botprefix;
    this.swarmcount = hash.botcount;
  });
  $scope.setSwarmParams = function(){
    follower.do_command('/local/bots/pokerbots/setSwarmParams',this.botparams);
  };
  $scope.$on('$destroy',(function(_t){
    var t = _t;
    return function(event){
      console.log('destroyed');
      for(var i in this.listeners){
        this.listeners[i].destroy();
      }
      this.listeners = {};
    };
  })(this));
  $scope.editable = false;

}]);
