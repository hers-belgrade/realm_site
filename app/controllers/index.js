/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('underscore');

function viewForUser(req){
  var user = req.user;
  if(!(req.isAuthenticated()&&user&&user.roles)){return 'login';}
  var roles = user.roles.split(',');
  if(roles.indexOf('player')>=0){return 'play';}
  if(roles.indexOf('admin')>=0){return 'index';}
}

exports.render = function(req, res) {
  var vu = viewForUser(req);
  console.log(req.user ? req.user.username : 'nobody','render view',vu);
  res.render(vu, {
      user: req.user ? JSON.stringify(req.user) : "null"
  });
};
