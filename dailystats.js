var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ppw-dev');

var db = mongoose.connection;
db.on('error',console.log.bind(console,'mongo error:'));
db.once('open',function(){
  console.log('connected');
});

var playertxnmodel = require('./node_modules/realm_site/playertxnmodel'),
  PlayerTxnModel = mongoose.model('PlayerTxn');

var startmoment = new Date((new Date())-400*24*60*60*1000);
console.log(startmoment);

PlayerTxnModel.aggregate(
  {
    $match: {moment: {$gt: startmoment}}
  },
  {
    $project: {
      in:{$cond:[{$lt:["$amount",0]},"$amount",0]},
      out:{$cond:[{$gt:["$amount",0]},"$amount",0]}
    }
  },
  {
    $group: {
      _id:0,
      in:{$sum:"$in"},
      out:{$sum:"$out"}
    }
  }
).exec(function(err,data){
  if(err){
    console.error(err);
  }else{
    console.log(data);
  }
});


