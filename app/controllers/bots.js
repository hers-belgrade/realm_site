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

function nextBot(){
  if(__BotRequests+__BotsEngaged>=dataMaster.element(['local','bots','botcount']).value()){
    //console.log(__BotRequests,'+',__BotsEngaged,'>=',dataMaster.element(['local','bots','botcount']).value());
    return;
  }
  //console.log(dataMaster.element(['local','bots','bots']).dataDebug());
  if(__BotsEngaged%50 === 0){
    //console.log(__BotsEngaged);
  }
  var now = _now();
  if((__lastScan && now-__lastScan>15000) || botnames.length<1){
    __lastScan = now;
    var found;
    var cnt = 0;
    dataMaster.element(['local','bots','botbase']).traverseElements(function(name,el){
      cnt++;
      botnames.push(name);
      var u = UserBase.findUser(name,dataMaster.realmName);
      if(!u){
        UserBase.setUser(name,dataMaster.realmName,'bot,player');
        //return true;
      }
    });
  }
  var targetbotname;
  var realm = UserBase.realms[dataMaster.realmName];
  for(var bn in realm){
    var b = realm[bn];
    if(!b.engagedIn){
      targetbotname = b.username;
      break;
    }
  }
  if(!targetbotname){
    targetbotname = botnames[~~(Math.random()*botnames.length)];
  }
  var pass = '';
  while(true){
    var u = UserBase.findUser(targetbotname+pass,dataMaster.realmName);
    if(!u){
      __BotRequests++;
      return UserBase.setUser(targetbotname+pass,dataMaster.realmName,'bot,player');
    }else{
      if(!u.engagedIn){
        __BotRequests++;
        return u;
      }
      if(!pass){
        pass=1;
      }else{
        pass++;
      }
    }
  }
};

function randValueFromRange(obj){
  return obj.min+(~~(Math.random()*((obj.max-obj.min)/obj.step)))*obj.step;
};
function randomPayment(data){
  return Math.random()<.2 ? data.condition : randValueFromRange(data);
};
function storeBot(username,servername,roomname,seat){
  dataMaster.element(['local','bots','bots']).commit('new_bot',[
    ['set',[username],'admin'],
    ['set',[username,'name'],[username,undefined,'admin']],
    ['set',[username,'servername'],[servername,undefined,'admin']],
    ['set',[username,'roomname'],[roomname,undefined,'admin']],
    ['set',[username,'seat'],[seat,undefined,'admin']]
  ]);
};
function dumpReservedBots(){
  var realm = UserBase.realms[dataMaster.realmName];
  for(var un in realm){
    var b = realm[un];
    if(b.reservedFor){
      //console.log(b.username,'=>',b.reservedFor);
    }
  }
};
function tryRecognize(name,servername,roomname,seat){
  /*
  var b = UserBase.findUser(name,dataMaster.realmName);
  if(!b){return;}
  */
  var found = false;
  dataMaster.element(['local','bots','botbase']).traverseElements(function(bname){
    if(name===bname){
      var b = UserBase.findUser(name,dataMaster.realmName,'bot,player');
      if(b){
        found = b;
        return true;
      }
      found = UserBase.setUser(name,dataMaster.realmName,'bot,player');
      if(found){
        //storeBot(name,servername,roomname,seat);
        return true;
      }
    }else if(name.indexOf(bname)===0){
      if(parseInt(name.substr(bname.length))){
        found = UserBase.setUser(name,dataMaster.realmName,'bot,player');
        return true;
      }else{
        //console.log(name,'cannot be',bname);
      }
    }
  });
  return found;
};

function tryEngageBot(roomname){
  var roomobj = _botRooms[roomname];
  if(!roomobj){return;}
  if(roomobj.available>0){
    //console.log('=>',roomname,roomobj.available);
    var servel = dataMaster.element(['nodes',roomobj.servname]);
    var bot = nextBot();
    if(bot){
      roomobj.available--;
      if(bot.engagedIn){
        console.log('nextBot gave me',bot.username,'who is already in',bot.engagedIn);
      }
      bot.engagedIn = roomname;
      bot.reservedFor = roomname;
      bot.invoke(servel,'rooms/'+roomname+'/pokerroom/letMeWatch',{},function(errcb){
        if(errcb!=='OK'){
          bot.destroy();
          return;
        }
        bot.invoke(servel,'rooms/'+roomname+'/pokerroom/beseat',{seat:~~(Math.random()*5)},function(errcode){
          //console.log('beseat said',errcb);
          if(errcode!=='OK'){
            bot.destroy();
          }
        })
      });
      bot.destroyed.attach(function(){
        dataMaster.element(['local','bots','bots']).commit('bot_out',[
          ['remove',[bot.username]]
        ]);
        __BotsEngaged--;
        if(!bot.beseated){
          __BotRequests--;
        }
        //console.log(__BotsEngaged);
      });
      return true;
    }else{
      return false;
    }
  }
};

var _botRooms = {};

function doBotRooms(){
  var bc = 0;
  var tm = Timeout.metrics();
  var crit = 100-(tm.delay||0);
  if(crit>0){
    for(var i in _botRooms){
      var rbe = tryEngageBot(i);
      if(rbe===false){break;}
      if(rbe===true){
        bc++;
      }
      if(bc>crit){
        break;
      }
    }
  }
  Timeout.set(doBotRooms,500);
}

doBotRooms();

function setBotStatus(u,stat){
  dataMaster.element(['local','bots','bots',u.username]).commit('set_status',[
    ['set',['status'],[stat,undefined,'dcp']]
  ]);
}

function botRoom(servel,roomname,servname){
  //console.log('botRoom for',servel,roomname,servname);
  var roomobj = _botRooms[roomname];
  if(roomobj){
    return;
  }
  var seats = [];
  roomobj = {servname:servname,destroy:function(){
    console.log('destroying room',roomname);
    delete _botRooms[roomname];
    for(var i in seats){
      var s = seats[i];
      if(s && s.destroy){
        s.destroy();
      }
    }
  }};
  _botRooms[roomname] = roomobj;
  //var roomel = servel.element(['rooms',roomname]);
  servel.waitFor(['rooms',roomname,'players','*','name'],function(seat,name){
    if(seat==='DISCARD_THIS'){
      roomobj.destroy();
      return;
    }
    if(name){
      //console.log(roomname,seat,name);
      var b = tryRecognize(name,servname,roomname,seat);
      if(b){
        __BotRequests--;
        if(roomobj.available<=0){
          //console.log(roomname,'not available',roomobj);
          //dataMaster.element(['nodes',servname]).invoke(['rooms',roomname,'players',seat,'private','exit'],{},b.username,dataMaster.realmName,'bot');
          //return;
        }
        //console.log('ok',b.username,'in',roomname,'at',seat);
        if(!b.engagedIn || (b.engagedIn === roomname)){
          __BotsEngaged++;
          //console.log(__BotRequests,__BotsEngaged);
          b.beseated=true;
          delete b.reservedFor;
          //dumpReservedBots();
          storeBot(b.username,servname,roomname,seat);
          setBotStatus(b,'entered');
          seats[seat] = b;
        }else{
          console.log(b.username,'is already engaged in',b.engagedIn,'instead of',roomname);
          process.exit(0);
        }
      }else{
        console.log(name,'is not recognized');
      }
    }else{
      if(seats[seat]){
        //console.log('player out on seat',seat,'in',roomname);
        seats[seat].destroy();
        delete seats[seat];
      }
    }
  });
  servel.waitFor(['rooms',roomname,'players','*','buyin'],function(seat,jsonbi){
    //console.log(roomname,seat,jsonbi);
    if(seat==='DISCARD_THIS'){
      roomobj.destroy();
      return;
    }
    if(seats[seat]){
      seats[seat].invoke(servel,'rooms/'+roomname+'/players/'+seat+'/private/confirmreservation',{buyin:randValueFromRange(JSON.parse(jsonbi))},function(errcb){
        //console.log('confirmreservation in',roomname,'for',seat,'said',errcb);
      });
    }else{
      //console.log('nobody sits on',seat);
    }
  });
  servel.waitFor(['rooms',roomname,'players','*','question','data'],function(seat,questionbi){
    if(seat==='DISCARD_THIS'){
      roomobj.destroy();
      return;
    }
    if(seats[seat]){
      if(!seats[seat].username){
        console.log('How did I get here?',roomname,'User destroyed, slot',seat,'just standing there, receiving a question...');
        seats[seat].destroy();
        delete seats[seat];
        return;
      }
      var u = seats[seat];
      setBotStatus(u,'answering');
      seats[seat].invoke(servel,'rooms/'+roomname+'/players/'+seat+'/private/answer',{amount:randomPayment(JSON.parse(questionbi))},function(errcb){
        //console.log('answer said',errcb);
        setBotStatus(u,'answered '+errcb);
        if(errcb!=='OK'){
          console.log(u.username,'got',errcb);
        }
      });
    }else{
      console.log('nobody sits on',seat);
    }
  });
  servel.waitFor(['rooms',roomname,['bots','playing']],function(map,oldmap){
    if(map==='DISCARD_THIS'){
      delete _botRooms[roomname];
      return;
    }
    roomobj.available = map.bots - map.playing;
  });
};

function createRoomListener(){
  return dataMaster.element(['rooms']).waitFor(['*',['class=Poker','type=CashTable','servername']],function(roomname,map){
    //console.log(roomname,map);
      botRoom(dataMaster.element(['nodes',map.servername]),roomname,map.servername);
  });
}

function listenToRooms(){
  console.log('listenToRooms');
  if(roomListener){
    roomListener.destroy();
  }
  var roomListener = createRoomListener();
  dataMaster.element(['local','bots','botcount']).changed.attach(function(el,changedmap){
    if(changedmap.private){
      var newbotcnt = el.value();
      var delta = __BotsEngaged-newbotcnt;
      if(delta>0){
        var badnames = [];
        dataMaster.element(['local','bots','bots']).traverseElements(function(name,el){
          var server = el.element(['servername']).value();
          var room = el.element(['roomname']).value();
          var seat = el.element(['seat']).value();
          //console.log(name,'playing at',room,seat);
          dataMaster.element(['nodes',server]).invoke(['rooms',room,'players',seat,'private','exit'],{},name,dataMaster.realmName,'bot',function(errc){
            if(errc!=='OK'){
              console.log(errc);
              badnames.push(name);
            }
          });
          delta--;
          if(!delta){
            return true;
          }
        });
        for(var i in badnames){
          UserBase.removeUser(badname,dataMaster.realmName);
        }
      }
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
    listenToRooms();
    //listenToNodes();
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
