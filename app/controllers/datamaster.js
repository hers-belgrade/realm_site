var util = require('util');
var http = require('http'),
    hersdata = require('hersdata'),
    dataMaster = new (hersdata.DataMaster)(),
    realmName = 'ppw',
    realmPassword = 'ppw',
    backofficeAddress = 'localhost';

dataMaster.commit('realm_born',[
  ['set',['local']]
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

function BOListener(system){
  dataMaster.commit('bo_started',[
    ['set',['nodes']],
    ['set',['local','bots']],
    ['set',['local','bots','botcount'],[10000]],
    ['set',['local','bots','botbase']],
    ['set',['local','bots','bots']]
  ]);
  dataMaster.waitFor(['system','*',['type=node','address','replicationPort']],function(servname,map){
    dataMaster.element(['nodes']).createRemoteReplica(servname,dataMaster.instanceName,dataMaster.domainName,{address:map.address,port:map.replicationPort},true); //true<=>skipdcp
    dataMaster.element(['nodes',servname]).go();
  });
  //dataMaster.element(['local','bots']).attach('pokerbots',{realmname:dataMaster.realmName,userfactory:dataMaster,serverfactory:dataMaster.element(['nodes'])});
  system.waitFor([system.replicaToken.name,'replicationPort'],function(val){
    console.log('opening replication on',val);
    dataMaster.replicationPort = val;
    dataMaster.element(['local']).openReplication(val);
  });
}

dataMaster.fingerprint = (require('crypto').randomBytes)(12).toString('hex');
//dataMaster.setSessionUserFactory();
/*
dataMaster.newUser.attach(function(newuser){
  var sysel = dataMaster.element(['system']);
  sysel && sysel.findUser(newuser.username,newuser.realmname,function(sysuser){
    if(!sysuser){return;}
    for(var i in sysuser.keys){
      !newuser.contains(i) && newuser.addKey(i);
    }
  });
});
*/
dataMaster.httpTalker = new HTTPTalker(backofficeAddress,8080);
dataMaster.realmName = realmName;
dataMaster.go = function(){
  var t = this.httpTalker;
  t.tell('/signinServer',{name:realmName,password:realmPassword},function(data){
    if(data.name){//ok
      console.log('going as',data.name);
      dataMaster.instanceName = data.name;
      dataMaster.domainName = data.domain;
      dataMaster.createRemoteReplica('system',data.name,dataMaster.realmName,{address:backofficeAddress,port:data.replicationPort});
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
module.exports = dataMaster;


