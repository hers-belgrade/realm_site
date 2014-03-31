var mongoose = require('mongoose'),
  Bot = mongoose.model('Bot'),
  dataMaster = require('./datamaster'),
  Timeout = require('herstimeout'),
  hersdata = require('hersdata'),
  UserBase = hersdata.UserBase,
  __BotRequests=0,
  __BotsEngaged=0;

function _now(){
  return (new Date()).getTime();
}

var __lastScan,botnames=[];

function randValueFromRange(obj){
  return obj.min+(~~(Math.random()*((obj.max-obj.min)/obj.step)))*obj.step;
};
function randomPayment(data){
  return Math.random()<.2 ? data.condition : randValueFromRange(data);
};

var _botRooms = {};

function createRoomListener(){
  return dataMaster.element(['rooms']).waitFor(['*',['class=Poker','type=CashTable','servername']],function(roomname,map){
    //console.log(roomname,map);
      botRoom(dataMaster.element(['nodes',map.servername]),roomname,map.servername);
  });
}

function BotPlayer(user,servername,roomname){
  this.user = user;
  this.user.makeSession('botsession');
  this.session = this.user.sessions['botsession'];
  this.session.push = function(item){
    console.log(item);
  };
  this.path = ['nodes',servername,'rooms',roomname];
}
BotPlayer.prototype.go = function(){
  console.log(this.user.username,'bidding for observer');
  this.user.bid(this.path.concat(['observer']),{},function(){
    console.log('observer bid said',arguments);
  });
  var t = this;
  this.user.bid(this.path.concat(['player']),{},function(errc,errp){
    console.log(errc,errp);
    if(errc==='DO_OFFER'){
      t.user.follow(t.path.concat(['__requirements','player','offers',errp[0],'data']));
    }
  });
}

function listenToRooms(){
  console.log('listenToRooms');
  dataMaster.superUser.waitFor(['nodes','*'],function(servername){
    dataMaster.superUser.waitFor(['nodes',servername,'rooms','*','type=CashTable'],function(name){
      console.log('listenToRooms',servername,name);
      var u = dataMaster.functionalities.sessionuserfunctionality.f._produceUser({name:'mika',roles:'player,bot'});
      if(u){
        var b = new BotPlayer(u,servername,name);
        b.go();
      }
    });
  });
}

function fillBotBase(){
  Bot.find({},function(err,bots){
    if(err){return;}
    var botbasebranch = dataMaster.element(['local','bots','botbase']);
    if(!botbasebranch){return;}
    var actions = [];
    for(var i in bots){
      var bot = bots[i];
      if(!bot && bot.username){continue;}
      actions.push(['set',[bot.username],[dataMaster.domainName+'/img/avatars/'+bot.avatar,undefined,'dcp']]);
    }
    botbasebranch.commit('init_botbase',actions);
    listenToRooms();
    //listenToNodes();
  });
};

dataMaster.getSuperUser(function(su){
  console.log(su);
  su.waitFor(['local','Collection:*'],function(name,ent){
    if(name==='bots' && ent){
      this.destroy();
      fillBotBase();
    }
  });
});

exports.save = function(req,res){
  var bot = new Bot(req.body);
  var boto = bot.toObject();
  delete boto.username;
  delete boto._id;
  Bot.findOneAndUpdate({username:req.body.username},boto,{upsert:true,new:true},function(err,bot){
    console.log(err,bot);
    res.jsonp(bot);
    dataMaster.element(['local','bots','botbase']).commit('new_bot',[
      ['set',[bot.username],[dataMaster.domainName+'/img/avatars/'+bot.avatar,undefined,'dcp']]
    ]);
  });
};


exports.all = function(req,res){
  Bot.find({},function(err,bots){
    res.jsonp(bots);
  });
};
