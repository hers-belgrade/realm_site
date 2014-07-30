angular.module('mean.ui').factory('historize', [function () {
  return function(hash,historyhash,trendhash,name,value,historylen) {
  historylen = historylen||20;
  if(typeof value === 'undefined'){
    delete hash[name];
  }else{
    if(!historyhash[name]){
      historyhash[name] = [];
    }
    historyhash[name].push(value);
    while(historyhash[name].length>historylen){
      historyhash[name].shift();
    }
    for(var i in historyhash){
      if(i===name){continue;}
      if(historyhash[i].length<historylen){
        historyhash[i].push(historyhash[i][historyhash[i].length-1]);
      }
    }
    if(hash[name]){
      trendhash[name] = ~~((value-hash[name])/hash[name]*100);
    }
    hash[name] = value;
  }
}}]);

