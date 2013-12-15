var fs = require('fs'),
  _ = require('underscore');

exports.all = function(req, res, next){
  var aa = _.map(fs.readdirSync('./public/img/avatars'),function(a){return {name:a}});
  res.jsonp(aa||[]);
};

exports.upload = function(req, res, next){
  var f = req.files.avatarfile;
  if(!f){next();}
  fs.readFile(f.path, function(err, data){
    fs.writeFile('./public/img/avatars/'+f.name, data, function(err){
      res.jsonp({'ok':1});
    });
  });
};
