var hersdata = require('hersdata'),
  Waiter = hersdata.Bridge.Data_CollectionElementWaiter;

function Player(playerel){
  console.log('new player');
};

function BotPlay(user,roomel,servname,roomname){
  var players = {};
  new Waiter(user,roomel,['players','*'],function(index,player){
    if(!players[index]){
      players[index] = Player.call(player,roomel.element(['players',index]));
    }
  });
}

module.exports = BotPlay;
