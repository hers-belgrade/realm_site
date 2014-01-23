/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    dataMaster = require('./datamaster'),
    _BC_ = new(require('hersdata').BigCounter)(),
    randomBytes = require('crypto').randomBytes,
    util = require('util');


/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
  dataMaster.setUser(req.user.username,dataMaster.realmName,req.user.roles,function(user){
    console.log('authorized',user.username,user.realmname,user.keys);
  });
  res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.user && req.user.username && dataMaster.removeUser(req.user.username,dataMaster.realmName);
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
  console.log('session',req.user);
  dataMaster.setUser(req.user.username,dataMaster.realmName,req.user.roles,function(user){
    console.log('authorized',user.username,user.realmname,user.keys);
  });
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res) {
    var user = new User(req.body);

    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            return res.render('users/signup', {
                errors: err.errors,
                user: user
            });
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};

exports.dumpData = function(req, res, next) {
  if(req && req.user && req.user.username){
      dataMaster.setUser(req.user.username,dataMaster.realmName,req.user.roles,function(user){
        //console.log('recognized',user.username,user.realmname,user.keys);
        if(!user){
          res.jsonp({none:null});
          return;
        }
        var sessid = req.query[dataMaster.fingerprint];
        if(!sessid){
          _BC_.inc();
          sessid=_BC_.toString()+randomBytes(8).toString('hex');
          console.log('created',sessid,'on',user.username);
        }
        //console.log(user.sessions);
        user.makeSession(sessid);
        var session = {};
        session[dataMaster.fingerprint]=sessid;
        var _res = res;
        res.jsonp({
          username:req.user.username,
          roles:user.roles,
          session:session,
          data:user.sessions[sessid].retrieveQueue()
        });
        res = null;
      });
  }else{
    console.log('dumpData with no username?');
      next();
  }
};

function executeOneOnUser(user,command,params,cb){
    switch(command){
      case '_':
        break;
      case 'follow':
        user.follow(params.path.slice());
        cb('OK',params.path);
        break;
      default:
        user.invoke(command,params,cb);
        break;
    }
}


function executeOnUser(user,session,commands,res){
    var sessionobj = {};
    sessionobj[dataMaster.fingerprint]=session;
    var ret = {username:user.username,roles:user.roles,session:sessionobj};
    var cmdlen = commands.length;
    var cmdstodo = cmdlen/2;
    var cmdsdone = 0;
    for (var i=0; i<cmdstodo; i++){
      var cmd = commands[i*2];
      var paramobj = commands[i*2+1];
      if(cmd.charAt(0)==='/'){
        cmd = cmd.slice(1);
      }
      executeOneOnUser(user,cmd,paramobj,(function(index,_res){
        var _i = index, __res = _res;
        return function(errcode,errparams,errmessage){
          if(!ret.results){
            ret.results=[];
          }
          ret.results[_i] = [errcode,errparams,errmessage];
          cmdsdone++;
          if(cmdsdone===cmdstodo){
            var s = user.sessions[session];
            if(!s){
              console.log('no',session,'in',user.username);
              _res.jsonp({errorcode:'NO_SESSION',errorparams:[session]});
              _res = null;
              return;
            }
            var so = {};
            so[dataMaster.fingerprint] = session;
            ret.data=s.retrieveQueue();
            _res.jsonp(ret);
            _res = null;
          }
        };
      })(i,res));
    }
};

exports.execute = function(req, res, next) {
  if(!(req.query && req.query.commands)){
    res.jsonp({none:null});
    return;
  }
  try{
    var commands = JSON.parse(req.query.commands);
    //console.log(commands);
    if(commands.length%2){
      res.jsonp({errorcode:'invalid_command_count',errorparams:commands});
      return;
    }
    dataMaster.setUser(req.user.username,dataMaster.realmName,req.user.roles,function(user){
      if(user){
        executeOnUser(user,req.query[dataMaster.fingerprint],commands,res);
      }else{
        res.jsonp({none:null});
        res = null;
      }
    });
  }
  catch(e){
    console.log(e.stack);
    console.log(e);
    res.jsonp({errorcode:'JSON',errorparams:[e,commands]});
  }
};
