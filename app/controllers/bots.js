var mongoose = require('mongoose'),
  Bot = mongoose.model('Bot'),
  dataMaster = require('./datamaster'),
  hersdata = require('hersdata'),
  Waiter = hersdata.Bridge.Data_CollectionElementWaiter;

function NodeListener(user){
  if(!user){return;}
  hersdata.Follower.call(this,user,['cluster','nodes'],hersdata.FollowerPatterns.TypeFollower(null,function(name){
    console.log('new server',name);
    new hersdata.Follower(user,['cluster','nodes',name],hersdata.FollowerPatterns.TypeFollower(function(name,val){
      console.log(name,'==',val);
    },null,null,function(){
      console.log(name,'is dead');
    }));
  },null,this));
}

function nextBot(){
  var found,pass='';
  while(!found){
    dataMaster.element(['local','bots','botbase']).traverseElements(function(name,el){
      dataMaster.findUser(name+pass,dataMaster.realmName,function(u){
        if(!u){
          dataMaster.setUser(name+pass,dataMaster.realmName,'bot,player',function(_u){
            found = _u;
          });
        }
      });
      if(found){
        return true;
      }
    });
    if(found){
      return found;
    }
    pass = (pass||0)+1;
  }
};

function roomBot(servname,roomname,roomel){
    console.log('should engage a bot in',roomname,'on',servname);
    var bot= nextBot();
    console.log(bot.username);
    dataMaster.element(['local','bots','bots']).commit('new_bot',[
      ['set',[bot.username]],
      ['set',[bot.username,'name'],[bot.username,undefined,'admin']],
      ['set',[bot.username,'room'],[roomname,undefined,'admin']]
    ]);
    bot.destroyed.attach(function(){
      dataMaster.element(['local','bots','bots']).commit('bot_out',[
        ['remove',[bot.username]]
      ]);
    });
    var botel = dataMaster.element(['local','bots','bots',bot.username]);
    new (require('./botplay'))(bot,roomel,servname,roomname);
};

function listenToNodes(){
  console.log('listenToNodes');
  new Waiter(dataMaster,dataMaster,['local','nodes','*','rooms','*',['class=Poker','type=CashTable','bots','playing','capacity']],function(servname,roomname,map){
    if(map.playing<map.bots){
      roomBot(servname,roomname,dataMaster.element(['local','nodes',servname,'rooms',roomname]));
    }
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
    listenToNodes();
  });
};

dataMaster.element(['local']).subscribeToElements(function(name,ent){
  if(name==='bots' && ent){
    fillBotBase();
  }
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
