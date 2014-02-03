var fs = require('fs'),
  _ = require('underscore'),
  mongoose = require('mongoose'),
  Avatar = mongoose.model('Avatar');

_.each(fs.readdirSync('./public/img/avatars'),function(a){
  //console.log(a);
  Avatar.findOne({name:a},function(err,avatar){
    if(!avatar){
      console.log('no avatar for',a);
      var _a =new Avatar({
        name:a,
        filename:a,
        gender:'',
        category:'',
        price:0
      });
      _a.save();
    }
  });
});

exports.all = function(req, res, next){
  Avatar.find(function(err,avs){
    res.jsonp(avs||[]);
  });
  /*
  var aa = _.map(fs.readdirSync('./public/img/avatars'),function(a){return {name:a}});
  res.jsonp(aa||[]);
  */
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

exports.remove = function(req, res, next){
  console.log(req.body);
};
