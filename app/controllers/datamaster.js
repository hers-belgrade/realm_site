var util = require('util');
var http = require('http'),
    hersdata = require('hersdata'),
    dataMaster = new (hersdata.DataMaster)(),
    realmName = 'ppw',
    realmPassword = 'ppw',
    backofficeAddress = process.argv[2] || '10.185.221.53';

dataMaster.commit('realm_born',[
  ['set',['local']],
  ['set',['nodes']],
]);

function HTTPTalker(host,port){
  this.host = host;
  this.port = port;
};
HTTPTalker.prototype.queryize = function(obj){
  var q = '';
  for(var i in obj){
    if(q){
      q+='&';
    }
    q+=i+'='+encodeURIComponent(obj[i]);
  }
  return q ? '?'+q : undefined;
};
HTTPTalker.prototype.tell = function(page,obj,cb){
  var req = http.request({
    host:this.host,
    port:this.port,
    path:page+this.queryize(obj)
  },function(res){
    var data = '',_cb = cb;
    res.setEncoding('utf8');
    res.on('data',function(chunk){
      data+=chunk;
    });
    res.on('end',function(){
      try{
        _cb(JSON.parse(data));
      }
      catch(e){
        console.log('error',e);
        _cb({error:data});
      }
    });
  });
  var t = this;
  req.on('error',function(err){
    var _t = t,p=page,o=obj,c=cb;
    setTimeout(function(){_t.tell(p,o,c);},1000);
  });
  req.end();
};


///back office listener ....
function BOListener(system){
  dataMaster.commit('bo_started',[
    ['set',['local','bots']],
    ['set',['local','bots','botcount'],[0]],
    ['set',['local','bots','botbase']],
    ['set',['local','bots','bots']]
  ]);
  dataMaster.waitFor(['system','*',['type=node','address','replicationPort']],function(servname,map){
    console.log('new node',servname,map);
    dataMaster.element(['nodes']).createRemoteReplica(servname,dataMaster.instanceName,dataMaster.functionalities.sessionuserfunctionality.f.realmName,{address:map.address,port:map.replicationPort},true); //true<=>skipdcp
    dataMaster.element(['nodes',servname]).go();
  });
  system.waitFor([system.replicaToken.name,'replicationPort'],function(val){
    console.log('opening replication on',val);
    dataMaster.replicationPort = val;
    dataMaster.element(['local']).openReplication(val);
  });
}

dataMaster.setSessionUserFunctionality({realmName:realmName});
dataMaster.httpTalker = new HTTPTalker(backofficeAddress,8080);

dataMaster.go = function(){
  var t = this.httpTalker;
  t.tell('/signinServer',{name:realmName,password:realmPassword},function(data){
    //console.log('signin said',data);
    if(data.name){//ok
      console.log('going as',data.name);
      dataMaster.instanceName = data.name;
      dataMaster.domainName = data.domain;
      dataMaster.createRemoteReplica('system',data.name,dataMaster.functionalities.sessionuserfunctionality.f.realmName,{address:backofficeAddress,port:data.replicationPort});
      var system = dataMaster.element(['system']);
      system.replicationInitiated.attach(function(){
        new BOListener(system);
      });
      system.go(function(status){
        console.log(status);
      });
    }else{
      console.log('login error',data.error);
    }
  });
};

var user_data_remap = ['username','balance','roles'];

dataMaster.userExists = function (user) {
  return dataMaster.element (['local', 'users', user.fullname]);
}

dataMaster.removeUser = function (user) {
  dataMaster.commit ('logout_user', [['remove', ['local', 'users', user.fullname]]]);
}

dataMaster.storeUser = function (user,profile){
  //just push user to data tree ...
  var fullname = user.fullname;
  profile = profile || {};
  profile.avatar = profile.avatar || '';
  profile.balance = profile.balance || 0;

  var txns = [
    ['set', ['local','users']],
    ['set', ['local','users', fullname]],
    ['set', ['local','users', fullname, 'payments_pending'], fullname],
    ['set', ['local','users', fullname, 'engagements']]
  ];
  if (profile) {
    for (var i in profile) {
      txns.push ( ['set', ['local', 'users', fullname, i], [profile[i]]]);
    }
  }
  dataMaster.commit ('storing_user', txns);
  console.log(dataMaster.element(['local','users']).dataDebug());
}

dataMaster.getUsersBalance = function (user) {
  var fun = user.fullname;
  var el = dataMaster.element(['local', 'users', fun,'balance']);
  if (!el) return undefined;
  return el.value();
}

dataMaster.createEngagement = function (user, room, opening_amount) {
  if (!opening_amount) return;
  console.log('ok, will create an engagement ...', user.fullname, room, opening_amount);
  var fun = user.fullname;
  console.log(dataMaster.element(['local','users',fun]).dataDebug());
  dataMaster.commit('opening_engagement', [
    ['set', ['local', 'users', fun, 'engagements', room], [opening_amount]]
  ]);
}

dataMaster.closeEngagement = function (user, room, closing_amount) {
  var fun = user.fullname;
  var el = this.element(['local', 'users', fun, 'engagements']);
  if (!el) return undefined;
  try {
    closing_amount = parseInt(closing_amount) || 0;
  }catch (e) {
    closing_amount = 0;
  }

  var balance = this.getUsersBalance(user);
  dataMaster.commit('closing_engagement', [
      ['remove', ['local', 'users', fun, 'engagements',room]],
      ['set', ['local', 'users', fun, 'balance'], [balance + closing_amount]]
  ]);
}

module.exports = dataMaster;
