var LobbyPokerEventsTranslator = (function () {
  function cardName (card){
    switch(card){
      case 1:
        return 'Deuce';
      case 2:
        return 'Three';
      case 3:
        return 'Four';
      case 4:
        return 'Five';
      case 5:
        return 'Six';
      case 6:
        return 'Seven';
      case 7:
        return 'Eight';
      case 8:
        return 'Nine';
      case 9:
        return 'Ten';
      case 10:
        return 'Jack';
      case 11:
        return 'Queen';
      case 12:
        return 'King';
      case 13:
        return 'Ace';
    }
  };

  function cardFromStrength(hs,pos){
    return cardName((hs>>(4*pos))%(16))
  };
  function handStrength (hs){
    switch((hs>>20)%(16)){
      case 1:
        return 'HighCard, '+cardFromStrength(hs,4)+' high'
      case 2:
        return 'Pair of '+cardFromStrength(hs,4)+'s'
      case 3:
        return 'Two Pair, '+cardFromStrength(hs,4)+'s with '+cardFromStrength(hs,3)+'s'
      case 4:
        return 'Three of a Kind, '+cardFromStrength(hs,4)+'s'
      case 5:
        return 'Straight'
      case 6:
        return 'Flush'
      case 7:
        return 'Full House, '+cardFromStrength(hs,4)+'s full of '+cardFromStrength(hs,3)+'s'
      case 8:
        return 'Four of a Kind, '+cardFromStrength(hs,4)+'s'
      case 9:
        return 'Straight Flush'
    }
  };

  function parseHandStart (hash, list) {
    var rd = list[0];
    hash.code='start';
    hash.codeicon= 'icon-play';
    hash.players = rd.players;
    hash.handId = rd.handId;
  };

  function parseHandEnd(hash) {
    hash.code='end';
    hash.codeicon= 'icon-stop';
  };

  function parsePaymentDoneEvent(hash,code,list, isAllIn){
    var str;
    var status_to_set;
    hash.player=list[0];
    hash.realm=list[1];
    switch(code){
      case 2:
        hash.code='ante';
        hash.codeicon='icon-medkit';
        break;
      case 3:
        hash.code='sb';
        hash.codeicon='icon-hospital';
        break;
      case 4:
        hash.code='bb';
        hash.codeicon='icon-ambulance';
        break;
      case 5:
        hash.code='check';
        hash.codeicon='icon-ok-sign';
        break;
      case 6:
        hash.code='call';
        hash.codeicon='icon-thumbs-up';
        break;
      case 7:
        hash.code='bet';
        hash.codeicon='icon-thumbs-up';
        break;
      case 8:
        hash.code='raise';
        hash.codeicon='icon-hand-up';
        break;
      default:
      break;
    }
    if(hash.code!=='check'){
      hash.amount=parseInt(list[2]);
    }
    if(isAllIn){
      hash.allin=true;
    }
  };

  function parsePaymentRejectionEvent(hash,code,list){
    hash.player=list[0];
    hash.realm=list[1];
    hash.code='fold';
    hash.codeicon='icon-thumbs-down';
  };

  function parseStreetEvent(hash,code,list_a){
    var streetlength = list_a.length;
    var list = list_a.slice();
    var str = '';
    hash.flop = [list[0],list[1],list[2]];
    switch(code){
      case 0:
        hash.code = 'flop';
        hash.codeicon='icon-user-md';
        break;
      case 1:
        hash.code = 'turn';
        hash.codeicon='icon-stethoscope';
        hash.turn = list[3];
        break;
      case 2:
        hash.code = 'river';
        hash.codeicon='icon-suitcase';
        hash.turn = list[3];
        hash.river = list[4];
        break;
      default:
        break;
    }
    return str;
  };

  function parseWinEvent(hash,code,list){
    hash.player=list[0];
    hash.realm=list[1];
    hash.pot=list[2]; 
    hash.amount=list[3];
    var potIndex;
    switch(code){
      case 0:
        hash.code='return';
        hash.codeicon='icon-rotate-right';
        break;
      case 1:
        hash.code='collect';
        hash.codeicon='icon-share-alt';
        break;
      case 2:
        hash.code='win';
        hash.codeicon='icon-trophy';
        hash.hand = handStrength(list[4]);
        break;
      case 3:
        hash.code='tie';
        hash.codeicon='icon-resize-full';
        hash.hand = handStrength(list[4]);
        break;
    }
  }
  var CodeBaseMap = {
    //system events
    '0':function (hash, code, content, all_in) {
      hash.klass = 'system';
      hash.hasplayer = false;
      switch(code) {
        case 1: {parseHandStart(hash, content); break;}
        case 2: {parseHandEnd(hash); break; }
      }
    },
    '1':function (hash, code, content) {
      //console.log('type: 1 code',code, 'content', content);
      hash.hasplayer = false;
      return undefined;
    },
    //payment
    '2':function (hash, code, content, all_in) {
      hash.klass = 'payment';
      hash.hasplayer = true;
      parsePaymentDoneEvent(hash, code, content, all_in);
    },
    //payment with all in
    '3':function (hash, code, content) {
      //hash.klass = 'allin';
      CodeBaseMap[2](hash, code, content, true);
    },
    //payment rejected
    '4':function (hash, code, content) {
      hash.klass = 'fold';
      hash.hasplayer = true;
      parsePaymentRejectionEvent (hash, code, content);
    },
    '5':function (hash, code, content) {
      hash.klass = 'community';
      hash.hasplayer = false;
      parseStreetEvent(hash, code, content);
    },
    //win event
    '6':function (hash, code, content) {
      hash.klass = 'win';
      hash.hasplayer = true;
      parseWinEvent(hash, code, content);
    }
  };

  return function (v, only_type) {
    if (!v) return undefined;
    if ('string' === typeof(v)) {
      try {
        v = JSON.parse(v);
      }catch (e) {return undefined;}
    }

    var ret = {timestamp:v.shift()};
    var eventcode=parseInt(v.shift());
    var type = Math.floor(eventcode/10);
    if ('undefined' !== typeof(only_type)) {
      if (type != only_type) {
        return undefined;
      }
    }
    (typeof CodeBaseMap[type] === 'function') ? CodeBaseMap[type](ret, eventcode - type*10, v) : undefined;
    return ret;
  }
})();

var LobbySlotEventsTranslator = (function(){
  function iconForCode(obj){
    switch(obj.eventcode){
      case 'init':
        return 'icon-play';
      case 'spin':
        if(obj.win){
          return 'icon-ok-sign';
        }else{
          return 'icon-thumbs-down';
        }
      case 'change_state':
        if(obj.to==='double_up'){
          return 'icon-hand-up';
        }else{
          return 'icon-hand-up';
        }
      case 'finish':
        return 'icon-stop';
      default:
        console.log('no icon for',obj.eventcode,obj);
    }
  }
  return function(obj){
    try{
      obj = JSON.parse(obj);
    }catch(e){return {};}
    console.log(obj);
    var ret = {
      klass:'Slot',
      player:obj.name,
      realm:obj.realm,
      code:obj.eventcode,
      codeicon:iconForCode(obj),
      amount:obj.delta,
      hasplayer:true
    };
    return ret;
  };
})();

function rescanEventsForAvatar(events,fullname,avatar){
  var el = events.length;
  for(var i=0; i<el; i++){
    var ev = events[i];
    if(ev.hasplayer && ev.player+'@'+ev.realm===fullname){
      ev.avatar = avatar;
    }
  }
}

function slotName(name){
  var tname = name.replace(/\d+$/,'');
  switch(tname){
    case 'queen_of_the_nile':
      return {name:name,caption:'Queen Of The Nile'};
  }
}

angular.module('HERS').controller('LobbyController',['$scope','follower',function($scope, follower){
  $scope.translate = null;
  $scope.lobby = {};
  $scope.slotDeltaColor = function(delta){
    if(delta<=100){return '#eee';}
    if(delta<=200){return '#ee2';}
    return '#e22';
  }
  $scope.isActive = function(){
    return follower.scalars && follower.scalars.renderer === 'lobby';
  };
  $scope.preview = function(){
    console.log(this.previewroomname);
    follower.do_command(':preview',this.previewroomname);
  };
  follower.listenToScalar({$scope:$scope,follower:follower},'renderer',{setter:function(val){
    if (!val || val.length === 0) return;

    var split = val.split(':');
    if(split[0]==='lobby'){
      
    }else{
      this.$scope.lobby = {};
    }
  }});
  follower.listenToCollection($scope,'casino',{activator:function(){
    follower.follow('casino').listenToCollections(this,{activator:function(name){
      var obj = {};
      follower.follow('casino').follow(name).listenToScalars({$scope:this,obj:obj,name:name},{setter:function(name,val){
        if(this.name==='preview'&&name==='name'){
          this.$scope.previewroomname = val;
        }
        if(typeof val === 'undefined'){
          //removal
          var k = this.$scope.lobby[this.obj.class];
          if(k && name){
            delete k[name];
          }
          return;
        }
        if(name==='name' && this.obj.class==='Slot'){
          val = slotName(val);
        }
        if(typeof val !== 'undefined'){
          this.obj[name] = val;
        }
        if(name==='class'){
          if(!this.$scope.lobby[val]){
            this.$scope.lobby[val] = {};
          }
          this.$scope.lobby[val][this.name] = this.obj;
          //console.log(name,val,this.$scope.lobby);
        }
      }});
      if(name==='preview'){
        follower.follow('casino').follow('preview').listenToScalar($scope,'class',{setter:function(val){
          if(typeof val==='undefined'){
            this.translate = null;
            return;
          }
          switch(val){
            case 'Poker':
              this.translate = LobbyPokerEventsTranslator;
              break;
            case 'Slot':
              this.translate = LobbySlotEventsTranslator;
              break;
          }
        }});
        follower.follow('casino').follow(name).listenToCollections({$scope:$scope,obj:obj},{activator:function(name){
          switch(name){
            case 'events':
              this.obj.events = [];
              follower.follow('casino').follow('preview').follow('events').listenToScalars(this,{setter:function(name,val){
                //console.log(name,val);
                if(typeof val === 'undefined'){
                  //this.obj.events=[];
                  //delete this.obj.events[name];
                }else{
                  var tr = this.$scope.translate;
                  if(!tr){return;}
                  val = tr(val);
                  if(!val.klass){return;}
                  if(val.hasplayer){
                    var fn = val.player+'@'+val.realm;
                    if(!(this.obj.avatars && this.obj.avatars[fn])){
                      console.log('no avatar for',fn,'in',this.obj.avatars);
                    }
                    val.avatar=(this.obj.avatars && this.obj.avatars[fn]) ? this.obj.avatars[fn] : '-';
                  }
                  val.hasamount = typeof val.amount === 'number';
                  val.hascards = typeof val.flop === 'object';
                  if(val){
                    this.obj.events.unshift(val);
                  }
                }
              }});
              break;
            case 'avatars':
              this.obj.avatars = this.obj.avatars || {};
              follower.follow('casino').follow('preview').follow('avatars').listenToScalars(this.obj,{setter:function(name,val){
                if(typeof val !== 'undefined'){
                  val = '/img/avatars/'+val;
                  if(typeof this.avatars[name] === 'undefined'){
                    rescanEventsForAvatar(this.events,name,val);
                  }
                  this.avatars[name] = val;
                }else{
                  delete this[name];
                }
                console.log('Slot avatars',this);
              }});
            case 'players':
              this.obj.avatars = this.obj.avatars || {};
              follower.follow('casino').follow('preview').follow('players').listenToCollections(this.obj.avatars,{activator:function(name){
                follower.follow('casino').follow('preview').follow('players').follow(name).listenToMultiScalars(this,['name','realm','avatar'],function(map){
                  this[map.name+'@'+map.realm]='/img/avatars/'+map.avatar;
                });
              }});
              break;
          }
        }});
      }
    }});
  },deactivator:function(){
    this.lobby = {};
  }});
}]);
