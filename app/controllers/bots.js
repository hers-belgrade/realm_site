var mongoose = require('mongoose'),
  Bot = mongoose.model('Bot'),
  dataMaster = require('./datamaster'),
  hersdata = require('hersdata'),
  UserBase = hersdata.UserBase,
  __BotsEngaged=0;

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


function _now(){
  return (new Date()).getTime();
}

var __lastScan,botnames=[];

function nextBot(){
  if(__BotsEngaged>=dataMaster.element(['local','bots','botcount']).value()){
    console.log(__BotsEngaged,'>=',dataMaster.element(['local','bots','botcount']).value());
    return;
  }
  var now = _now();
  if((__lastScan && now-__lastScan>15000) || botnames.length<1){
    __lastScan = now;
    var found;
    dataMaster.element(['local','bots','botbase']).traverseElements(function(name,el){
      botnames.push(name);
      var u = UserBase.findUser(name,dataMaster.realmName);
      if(!(u&&found)){
        found = UserBase.setUser(name,dataMaster.realmName,'bot,player');
        __BotsEngaged++;
        //return true;
      }
    });
    if(found){
      return found;
    }
  }
  var targetbotname = botnames[~~(Math.random()*botnames.length)];
  var pass = 1;
  while(true){
    var u = UserBase.findUser(targetbotname+pass,dataMaster.realmName);
    if(!u){
      __BotsEngaged++;
      return UserBase.setUser(targetbotname+pass,dataMaster.realmName,'bot,player');
    }else{
      pass++;
    }
  }
};

function randValueFromRange(obj){
  return obj.min+(~~(Math.random()*((obj.max-obj.min)/obj.step)))*obj.step;
};
function randomPayment(data){
  return Math.random()<.2 ? data.condition : randValueFromRange(data);
};
function tryRecognize(name){
  /*
  var b = UserBase.findUser(name,dataMaster.realmName);
  if(!b){return;}
  */
  var found = false;
  dataMaster.element(['local','bots','botbase']).traverseElements(function(bname){
    if(name===bname){
      __BotsEngaged++;
      found = UserBase.setUser(name,dataMaster.realmName,'bot,player');
      return true;
    }else if(name.indexOf(bname)===0){
      if(parseInt(name.substr(bname.length))){
        __BotsEngaged++;
        found = UserBase.setUser(name,dataMaster.realmName,'bot,player');
        return true;
      }
    }
  });
  return found;
};

function botRoom(servel,roomname){
  //var roomel = servel.element(['rooms',roomname]);
  var bots = {};
  var seats = {};
  servel.waitFor(['rooms',roomname,'players','*','name'],function(seat,name){
    if(name){
      if(bots[name]){
        seats[seat] = bots[name];
        delete bots[name];
      }else{
        var b = tryRecognize(name);
        if(b){
          seats[seat] = b;
        }else{
          console.log(name,'is not recognized');
        }
      }
    }else{
      if(seats[seat]){
        seats[seat].destroy();
        delete seats[seat];
      }
    }
  });
  servel.waitFor(['rooms',roomname,'players','*','buyin'],function(seat,jsonbi){
    if(seats[seat]){
      seats[seat].invoke(servel,'rooms/'+roomname+'/players/'+seat+'/private/confirmreservation',{buyin:randValueFromRange(JSON.parse(jsonbi))},function(errcb){
        //console.log('confirmreservation said',errcb);
      });
    }else{
      console.log('nobody sits on',seat);
    }
  });
  servel.waitFor(['rooms',roomname,'players','*','question','data'],function(seat,questionbi){
    if(seats[seat]){
      if(!seats[seat].username){
        console.trace();
        console.log('How did I get here?',roomname,'User destroyed, slot',seat,'just standing there, receiving a question...');
        delete seats[seat];
        return;
      }
      var u = seats[seat];
      seats[seat].invoke(servel,'rooms/'+roomname+'/players/'+seat+'/private/answer',{amount:randomPayment(JSON.parse(questionbi))},function(errcb){
        //console.log('answer said',errcb);
        if(errcb!=='OK'){
          console.log(u.username,'got',errcb);
        }
      });
    }else{
      console.log('nobody sits on',seat);
    }
  });
  servel.waitFor(['rooms',roomname,['bots','playing']],function(map){
    if(map.bots>map.playing){
      var bot = nextBot();
      if(bot){
        bots[bot.username] = bot;
        bot.invoke(servel,'rooms/'+roomname+'/pokerroom/letMeWatch',{},function(errcb){
          bot.invoke(servel,'rooms/'+roomname+'/pokerroom/beseat',{seat:~~(Math.random()*10)},function(errcb){
            //console.log('beseat said',errcb);
          })
        });
        bot.destroyed.attach(function(){
          __BotsEngaged--;
        });
      }
    }
  });
};

function botServer(servname,servel){
  console.log(servname);//,servel);
  servel.replicationInitiated.attach(function(){
    var _se = servel;
    servel.waitFor(['rooms','*',['class=Poker','type=CashTable']],function(roomname){
      //console.log('botRoom',arguments);
      botRoom(_se,roomname);
    });
  });
}

function listenToNodes(){
  console.log('listenToNodes');
  //return;
  var nodesel = dataMaster.element(['nodes']);
  nodesel.waitFor(['*'],botServer);
  //nodesel.waitFor(['*','rooms','*',['class=Poker','type=CashTable']],botRoom);
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

dataMaster.waitFor(['local','Collection:*'],function(name,ent){
  if(name==='bots' && ent){
    console.log(this);
    this.destroy();
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
