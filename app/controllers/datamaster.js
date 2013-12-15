var http = require('http'),
    hersdata = require('hersdata'),
    dataMaster = new (hersdata.DataMaster)(),
    realmName = 'ppw',
    realmPassword = 'ppw',
    backofficeAddress = 'localhost';


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


function BOListener(user){
  hersdata.Follower.call(this,user,[],hersdata.FollowerPatterns.TypeFollower(function(name,val){
  },function(name){
    console.log('new collection',name);
  },function(name){
  }));
  user.data.go();
}



var replicationPort = 16021;
    
dataMaster.fingerprint = (require('crypto').randomBytes)(12).toString('hex');
dataMaster.setSessionUserFactory();
dataMaster.openReplication(replicationPort);
dataMaster.replicationPort = replicationPort;

var t = new HTTPTalker(backofficeAddress,3000);
t.tell('/signinServer',{name:realmName,password:realmPassword,replicationport:replicationPort},function(data){
  if(data.name){//ok
    var boel = dataMaster.element(['backoffice']);
    if(!boel){
      dataMaster.createRemoteReplica('backoffice',realmName,{host:backofficeAddress,port:data.replicationPort});
      boel = dataMaster.element(['backoffice']);
    }
    boel.setUser(realmName,realmName,'dcp,realm',function(u){
      new BOListener(u);
    });
  }else{
    console.log('login error',data.error);
  }
});
module.exports = dataMaster;


