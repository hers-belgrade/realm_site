var util = require('util');
var http = require('http'),
    hersdata = require('hersdata'),
    dataMaster = new (hersdata.DataMaster)(),
    HookCollection = hersdata.HookCollection,
    realmName = 'ppw',
    realmPassword = 'ppw',
    backofficeAddress = 'localhost';

function removeFromArray(ar,el){
  var ind = ar.indexOf(el);
  if(ind>=0){
    ar.splice(ind,1);
    return true;
  }
}
function addToArray(ar,el){
  var ind = ar.indexOf(el);
  if(ind<0){
    ar.push(el);
    return true;
  }else{
    console.log(ar,'already has',el)
  }
};
function ConsumingScalar(el,name){
  this.observers = [];
  this.subscribers = [];
  this.checkers = [];
  this.el = el;
  this.name = name;
  this.deleter = JSON.stringify([this.name]);
  this.setValues();
  console.log('new ConsumingScalar',name);
  var t = this;
  el.changed.attach(function(){
    //console.log(name,'changed',t.subscribers.length,'subs',t.observers.length,'obs');
    var key = el.access_level();
    for(var i in t.checkers){
      t.checkers[i](key);
    }
    t.setValues();
    if(typeof this.value !== 'undefined'){
      for(var i in t.subscribers){
        t.subscribers[i](this.value);
      }
    }
    if(typeof this.public_value !== 'undefined'){
      for(var i in t.observers){
        t.observers[i](this.public_value);
      }
    }
  });
};
ConsumingScalar.prototype.setValues = function(){
  var v = this.el.value(),pv = this.el.public_value();
  if(typeof v !== 'undefined'){
    this.value = JSON.stringify([this.name,v]);
  }else{
    delete this.value;
  }
  if(typeof pv != 'undefined'){
    this.public_value = JSON.stringify([this.name,pv]);
  }else{
    delete this.public_value;
  }
};
ConsumingScalar.prototype.add = function(h){
  var u=h.user,loc;
  if(u.contains(this.el.access_level())){
    if(addToArray(this.subscribers,h)){
      loc=1;
      if(typeof this.value !== 'undefined'){
        h.push(this.value);
      }
    }
  }else{
    if(addToArray(this.observers,h)){
      loc=2;
      if(typeof this.public_value !== 'undefined'){
        h.push(this.public_value);
      }
    }
  }
  var t = this;
  console.log('after adding user',t.subscribers.length,'subs',t.observers.length,'obs');
  var ch = function(key){
    if(u.contains(key)){
      if(loc===2){
        removeFromArray(t.observers,h);
        addToArray(t.subscribers,h);
      }
    }else{
      if(loc===1){
        console.log('switching',u.keys,'from subs to obs');
        h.push(t.deleter);
        removeFromArray(t.subscribers,h);
        addToArray(t.observers,h);
      }
    }
  };
  this.checkers.push(ch);
  u.newKey.attach(function(key){
    if(t.el.access_level()===key){
      removeFromArray(t.observers,h);
      addToArray(t.subscribers,h);
      typeof t.value !== 'undefined' && h.push(t.value);
    }
  });
  u.keyRemoved.attach(function(key){
    if(t.el.access_level()===key){
      removeFromArray(t.subscribers,h);
      addToArray(t.observers,h);
      typeof t.public_value !== 'undefined' && h.push(t.public_value);
    }
  });
  h.destroyed.attach(function(){
    removeFromArray(t.checkers,ch);
    removeFromArray(t.subscribers,h);
    removeFromArray(t.observers,h);
  });
};
function ConsumingCollection(el,name){
  console.log('new ConsumingCollection',name);
  this.scalars = {};
  this.collections = {};
  this.subscribers = [];
  this.pretendents = [];
  this.waiters = [];
  this.checkers = [];
  this.key = el.access_level();
  this.describer = JSON.stringify([name,null]);
  this.deleter = JSON.stringify([name]);
  this.name = name;
  var t = this;
  el.subscribeToElements(function(name,el){
    if(el){
      var ent, target;
      switch(el.type()){
        case 'Scalar':
          target = t.scalars;
          if(target[name]){break;}
          console.log(t.name,'creating new Scalar',name);
          ent = new ConsumingScalar(el,name);
          for(var i in t.subscribers){
            ent.add(t.subscribers[i]);
          }
          break;
        case 'Collection':
          target = t.collections;
          if(target[name]){break;}
          console.log(t.name,'creating new Collection',name);
          ent = new ConsumingCollection(el,name);
          var ek = ent.key;
          for(var i in t.subscribers){
            var s = t.subscribers[i];
            if(s.user.contains(ek)){
              s.push(ent.describer);
            }
          }
          var rw = [];
          for(var i in t.waiters){
            var w = t.waiters[i];
            if(w.waitingpath[0]===name){
              w.waitingpath.shift();
              ent.add(w);
              rw.push(w);
            }
          }
          for(var i in rw){
            removeFromArray(t.waiters,rw[i]);
          }
          break;
      }
      if(target && ent){
        target[name] = ent;
      }
    }else{
      console.log('destroyed',name);
      for(var i in t.subscribers){
      }
      for(var i in t.pretendents){
      }
    }
  });
  var t = this;
  el.accessLevelChanged.attach(function(){
    var key = el.access_level();
    for(var i in t.checkers){
      t.checkers[i](key);
    }
    t.key = key;
  });
  el.newUser.attach(function(u){
    upgradeUserToConsumer(u,t);
  });
  this.el = el;
};
ConsumingCollection.prototype.target = function(name){
  return this.collections[name] || this.scalars[name];
};
ConsumingCollection.prototype.reportCollections = function(h){
  var ret =  [];
  for(var i in this.collections){
    var c = this.collections[i];
    if(h.user.contains(c.key)){
      ret.push(c.name);
      h.push(c.describer);
    }
  }
  h.subscribedTo = ret;
};
ConsumingCollection.prototype.unReportCollections = function(h){
  for(var i in h.subscribedTo){
    h.push(this.collections[h.subscribedTo[i]].deleter);
  }
  delete h.subscribedTo;
};
ConsumingCollection.prototype.handleHandler = function(h,criterion){
  if(h.waitingpath){return;}
  if(criterion){
    h.loc = 1;
    removeFromArray(this.pretendents,h);
    addToArray(this.subscribers,h);
    this.reportCollections(h);
  }else{
    h.loc = 2;
    this.unReportCollections(h);
    removeFromArray(this.subscribers,h);
    addToArray(this.pretendents,h);
  }
};
ConsumingCollection.prototype.add = function(h){
  if(h.waitingpath){
    addToArray(this.waiters,h);
    return;
  }
  var init = JSON.stringify([null,'init']);
  h.push(init);
  this.handleHandler(h,h.user.contains(this.key));
  for(var i in this.scalars){
    this.scalars[i].add(h);
  }
  h.push(init);
  var t = this;
  h.user.newKey.attach(function(key){
    if(key===t.key){
      if(h.loc===2){
        removeFromArray(t.pretendents,h);
        addToArray(t.subscribers,h);
        subscribedto = t.reportCollections(h);
      }
    }
  });
  h.user.keyRemoved.attach(function(key){
    if(key===t.key){
      if(h.loc===1){
        t.unReportCollections(h);
        removeFromArray(t.subscribers,h);
        addToArray(t.pretendents,h);
      }
    }
  });
  h.destroyed.attach(function(){
    removeFromArray(t.waiters,h);
    removeFromArray(t.subscribers,h);
    removeFromArray(t.pretendents,h);
  });
};

function inserter(pathstring,sess){
  return {
    destroyed:sess.destroyed,
    user:sess.user,
    push: function(item){
      sess.queue.push(JSON.stringify([pathstring,item]));
    }
  };
};
function ConsumerSession(u,coll){
  this.queue = [];
  this.followers = {};
  this.destroyed = new HookCollection();
  this.user = u;
  this.collection = coll;
  coll.add(inserter([],this));
  for(var i in u.followingpaths){
    var ps = u.followingpaths[i];
    this.follow(JSON.parse(ps),ps);
  }
  var t = this;
  u.destroyed.attach(function(){
    t.destroyed.fire();
    for(var i in t){
      delete t[i];
    }
  });
};
ConsumerSession.prototype.follow = function(path,pathstring){
  if(this.followers[pathstring]){
    return;
  }
  var f = inserter(pathstring,this);
  this.followers[pathstring] = f;
  var target = this.collection;
  while(path.length){
    var t = target.target([path[0]]);
    if(!t){
      f.waitingpath = path;
      target.add(f);
      return;
    }
    target = t;
    path.shift();
  }
  target.add(f);
};
ConsumerSession.prototype.retrieveQueue = function(){
  if(this.queue.length){
    console.log('splicing',this.queue);
    return this.queue.splice(0);
  }else{
    return [];
  }
};
function upgradeUserToConsumer(u,coll){
  u.sessions = {};
  u.followingpaths = [];
  /*
  for(var i in coll.collections){
    var c = coll.collections[i];
    if(u.contains(c.el.access_level())){
      u.queue[0].push([i,null]);
    }
  }
  for(var i in coll.scalars){
    var s = coll.scalars[i];
    if(u.contains(s.el.access_level())){
      if(typeof s.value !== 'undefined'){
        u.queue[0].push([i,s.value]);
      }
    }else{
      if(typeof s.public_value !== 'undefined'){
        u.queue[0].push([i,s.public_value]);
      }
    }
  }
  */
  u.makeSession = function(sess){
    if(this.sessions[sess]){return;}
    this.sessions[sess] = new ConsumerSession(this,coll);
  };
  u.follow = function(path){
    console.log('follow',path);
    if(!path.length){
      return;
    }
    var ps = JSON.stringify(path);
    addToArray(u.followingpaths,ps);
    for(var i in u.sessions){
      u.sessions[i].follow(path,ps);
    }
  };
  u.dump = function(txnalias){
    //console.log('dump',console.log(util.inspect(u.queue,false,null,false),util.inspect(u.childQueues,false,null,false)));
  };
};

/*
new ConsumingCollection(dataMaster);
dataMaster.txnEnds.attach(function(txnalias){
  for(var i in dataMaster.realms){
    var r = dataMaster.realms[i];
    for(var j in r){
      var u = r[j];
      u.dump(txnalias);
    }
  }
});
*/

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

function SelfFollower(user){
  if(!user){return;}
  hersdata.Follower.call(this,user,['cluster_interface'],hersdata.FollowerPatterns.TypeFollower(null,function(name,val){
    if(name===user.data.replicaToken.name){
      hersdata.Follower.call(this,user,['cluster_interface',user.data.replicaToken.name],hersdata.FollowerPatterns.ScalarFollower('replicationPort',function(val){
        console.log('opening replication on',val);
        dataMaster.replicationPort = val;
        dataMaster.element(['local']).openReplication(val);
      }));
    }
  },null,this));
}

function BOListener(user){
  this.data = function(){
    return user.data;
  };
  dataMaster.commit('bots_started',[
    ['set',['local','bots']]
  ]);
  dataMaster.element(['local','bots']).attach('pokerbots',{realmname:dataMaster.realmName,instancename:user.data.replicaToken.name});
  hersdata.Follower.call(this,user,[],hersdata.FollowerPatterns.TypeFollower(function(name,val){
  },function(name){
    switch(name){
      case 'cluster_interface':
        this.selfFollower = new SelfFollower(user);
        break;
    }
  },function(name){
  },this));
}

dataMaster.fingerprint = (require('crypto').randomBytes)(12).toString('hex');
dataMaster.setSessionUserFactory();
dataMaster.newUser.attach(function(newuser){
  var sysel = dataMaster.element(['system']);
  sysel && sysel.findUser(newuser.username,newuser.realmname,function(sysuser){
    if(!sysuser){return;}
    for(var i in sysuser.keys){
      !newuser.contains(i) && newuser.addKey(i);
    }
  });
});
dataMaster.httpTalker = new HTTPTalker(backofficeAddress,8080);
dataMaster.realmName = realmName;
dataMaster.go = function(){
  var t = this.httpTalker;
  t.tell('/signinServer',{name:realmName,password:realmPassword},function(data){
    if(data.name){//ok
      console.log('going as',data.name);
      dataMaster.domainName = data.domain;
      dataMaster.createRemoteReplica('system',data.name,dataMaster.realmName,{address:backofficeAddress,port:data.replicationPort});
      var system = dataMaster.element(['system']);
      system.userFactory = {create:function(data,username,realmname,roles){
        console.log('system creates a new user',username,realmname,roles);
        dataMaster.setUser(username,realmname,roles);
        var ret = new hersdata.KeyRing(data,username,realmname,roles);
        ret.newKey.attach(function(key){
          console.log('dataMaster should setKey',username,realmname,key);
          dataMaster.setKey(username,realmname,key);
          //console.log(dataMaster.realms[realmname]);
        });
        ret.keyRemoved.attach(function(key){
          //console.log('dataMaster should removeKey',username,realmname,key);
          dataMaster.removeKey(username,realmname,key);
        });
        return ret;
      }};
      system.getReplicatingUser(function(user){
        dataMaster.backoffice_listener = new BOListener(user);
      });
      system.go(function(status){
        console.log(status);
      });
      /*
      dataMaster.backoffice_replica = new (hersdata.RemoteCollectionReplica)(data.name,dataMaster.realmName,{address:backofficeAddress,port:data.replicationPort});
      dataMaster.backoffice_replica.getReplicatingUser(function(user){
        dataMaster.backoffice_listener = new BOListener(user);
      });
      dataMaster.backoffice_replica.go(function(status){
        console.log(status);
      });
      */
    }else{
      console.log('login error',data.error);
    }
  });
};
module.exports = dataMaster;


