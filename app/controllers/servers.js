var mongoose = require('mongoose'),
    _ = require('underscore'),
    Server = mongoose.model('Server'),
    dataMaster = require('./datamaster'),
    Timeout = require('herstimeout');

dataMaster.commit('servers_init',[
  ['set',['cluster_interface'],'dcp'],
  ['set',['cluster'],'dcp'],
  ['set',['rooms']],
  ['set',['roomfilters']],
  ['set',['roomfilters','capacity']],
  ['set',['roomfilters','flavor']],
  ['set',['roomfilters','bigblind']]
]);

function handleRoom(servername,name,map){
  var re = dataMaster.element(['rooms']);
  if(map.name){
    var _re = re.element([name]);
    var actions = [];
    var txnalias;
    if(!_re){
      txnalias = 'new_room';
      actions.push(['set',[name]]);
    }else{
      txnalias = 'room_update';
    }
    for(var i in map){
      actions.push(['set',[name,i],[map[i]]]);
    }
    actions.push(['set',[name,'servername'],[servername]]);
    Timeout.next(function(re,a){re.commit(txnalias,a);},re,actions);
  }
}

function handleFilters(name,map){
  var fe = dataMaster.element(['roomfilters']);
  var factions = [];
  fe.traverseElements(function(name,el){
    var fv = map[name];
    var fvi = fe.element([name,fv]);
    if(!fvi){
      factions.push(['set',[name]]);
    }
    var fvivalel = fe.element([name,fv]);
    if(!fvivalel){
      factions.push(['set',[name,fv],[1]]);
    }else{
      factions.push(['set',[name,fv],[fvi.value()+1]]);
    }
  });
  Timeout.next(function(fe,a){fe.commit('filter_update',a);},fe,factions);
}

function handleServer(servname,servel){
  console.log(servname);//,servel);
  servel.replicationInitiated.attach(function(){
    var sn = servname;
    servel.waitFor(['rooms','*',['name','class=Poker','templatename','type','flavor','capacity','playing','bigblind']],function(name,map){
      //console.log(name,map);
      handleRoom(sn,name,map);
      handleFilters(name,map);
    });
    servel.waitFor(['rooms','*',['class=Slot','name','slot_config']],function(name,map){
      console.log(name,map);
      handleRoom(sn,name,map);
    });
  });
}

dataMaster.element(['nodes']).waitFor(['*'],handleServer);

exports.authCallback = function(req, res, next){
  console.log(req.user);
  var servname = req.user.name;
  var replicationport = req.query.replicationport;
  console.log(servname,'replicating on',replicationport);
  var servel = dataMaster.element(['cluster',servname]);
  if(!servel){
    dataMaster.commit('new_server',[
      ['set',['cluster_interface',servname],servname]
    ]);
    dataMaster.element(['cluster']).createRemoteReplica(servname,'dcp',{host:req._remoteAddress,port:replicationport});
    var servel = dataMaster.element(['cluster',servname]);
  }
  dataMaster.setUser(servname,'dcp',['dcp',servname].join(','));
  res.jsonp({name:servname,replicationPort:dataMaster.replicationPort});
};

exports.save = function(req, res) {
  var s = new Server(req.body);
  var so = s.toObject();
  delete so.name;
  Server.findOneAndUpdate({name:req.body.name},so,{upsert:true,new:true},function(err,server){
    console.log(err,server);
    res.jsonp({name:server});
  });
};

exports.all = function(req,res) {
  Server.find({},function(err,srvs){
    res.jsonp(srvs);
  });
};
