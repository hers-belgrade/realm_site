var __LogInterpretation = {
  system:{
    roomcreated:function(item){
      item.htmltypeclass = 'icon-info';
      item.htmlcolorclass = 'blue-ico';
      item.msg = "New "+item.params[0]+" room "+item.params[1]+" created";
    },
    roomclosed:function(item){
      item.htmltypeclass = 'icon-info';
      item.htmlcolorclass = 'red-ico';
      item.msg = item.params[0]+" room "+item.params[1]+" closed";
    }
  },
  finance:{
    roomjoined:function(item){
      item.htmlcolorclass = 'blue-ico';
      switch(item.params[0]){
        case 'bot':
          item.htmltypeclass = 'icon-Bot';
          break;
        case 'player':
          item.htmltypeclass = 'icon-info';
          break;
      }
      item.klass = item.params[2];
      item.room = item.params[3];
      item.msg = item.params[0]+" "+item.params[1]+" takes a seat "+" with "+item.params[4];
    },
    roomleft:function(item){
      item.htmlcolorclass = 'red-ico';
      switch(item.params[0]){
        case 'bot':
          item.htmltypeclass = 'icon-Bot';
          break;
        case 'player':
          item.htmltypeclass = 'icon-info';
          break;
      }
      item.klass = item.params[2];
      item.room = item.params[3];
      item.msg = item.params[0]+" "+item.params[1]+" leaves with "+item.params[4];
    }
  }
};

var __LogItemFields = ['category','code','params','moment'];

function __LogItemFull(item){
  for(var i in __LogItemFields){
    if(typeof item[__LogItemFields[i]] === 'undefined'){
      return false;
    }
  }
  return true;
}


angular.module('mean.system').controller('LogController',['$scope','follower',function($scope,follower){
  follower.do_command(':activate','log');
  $scope.items = [];
  follower.listenToCollection($scope.items,'log',{activator:function(){
    follower.follow('log').listenToCollections(this,{activator:function(name){
      var o = {};
      follower.follow('log').follow(name).listenToScalars({t:this,o:o},{setter:function(name,val){
        if(typeof val === 'undefined'){
          //delete this.o[name];
        }else{
          this.o[name] = (name==='params' || name==='moment')?JSON.parse(val) : val;
          if(__LogItemFull(this.o)){
            var ifn = __LogInterpretation[this.o.category] ? __LogInterpretation[this.o.category][this.o.code] : null;
            if(ifn){
              ifn(this.o);
            }
            this.t.unshift(this.o);
            if(this.t.length>100){
              this.t.pop();
            }
          }
        }
      }});
    }});
  }});
  $scope.$on('$destroy',function(event){
    follower.do_command(':deactivate','log');
    delete event.currentScope.events;
  });
}]);
