var mongoose = require('mongoose'),
  Bot = mongoose.model('Bot'),
  dataMaster = require('./datamaster');

function listenToNodes(){
}

function fillBotBase(){
  Bot.find({},function(err,bots){
    if(err){return;}
    var botbasebranch = dataMaster.element(['bots','botbase']);
    if(!botbasebranch){return;}
    var actions = [];
    for(var i in bots){
      var bot = bots[i];
      actions.push(['set',[bot.username],[dataMaster.domainName+'/img/avatars/'+bot.avatar,undefined,'dcp']]);
    }
    botbasebranch.commit('init_botbase',actions);
    listenToNodes();
  });
};

dataMaster.subscribeToElements(function(name,ent){
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
  });
};


exports.all = function(req,res){
  Bot.find({},function(err,bots){
    res.jsonp(bots);
  });
};
