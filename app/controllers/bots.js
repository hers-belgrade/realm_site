var mongoose = require('mongoose'),
  Bot = mongoose.model('Bot'),
  dataMaster = require('./datamaster'),
  hersdata = require('hersdata');

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

function listenToNodes(){
  dataMaster.element(['system']).getReplicatingUser(function(user){
    dataMaster.invoke('/local/bots/pokerbots/addServer',{address:user.data.url.address,port:user.data.url.port,initialpath:['cluster','nodes']},'admin','local','admin',function(errc,errp,errm){
      if(errc==='OK'){
        dataMaster.invoke('/local/bots/pokerbots/setSwarmParams',{botcount:0,botprefix:''},'admin','local','admin',function(errc,errp,errm){
        });
      }
    });
  });
  return;
  dataMaster.element(['system']).getReplicatingUser(function(user){
    new NodeListener(user);
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
    dataMaster.element(['local','bots','botbase']).commit('new_bot',['set',[bot.username],[dataMaster.domainName+'/img/avatars/'+bot.avatar,undefined,'dcp']]);
  });
};


exports.all = function(req,res){
  Bot.find({},function(err,bots){
    res.jsonp(bots);
  });
};
