/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    dataMaster = require('./datamaster');


/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
  dataMaster.element(['rooms']).setUser(req.user.username,'player');
    console.log(req.user.roles);
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
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
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
    if(req && req.user && req.user.name){
        dataMaster.setUser(req.user.name,'www','',function(user){
          var sessid = req.query[dataMaster.fingerprint];
          if(!sessid){
            sessid=~~(Math.random()*1000000);
          }
            user.makeSession(sessid);
            var session = {};
            session[dataMaster.fingerprint]=sessid;
            user.sessions[sessid].dumpQueue(function(data){
                res.jsonp({
                    username:req.user.name,
                    roles:user.roles,
                    session:session,
                    data:data
                });
            });
        });
    }else{
        next();
    }
};

exports.execute = function(req, res, next) {
    res.jsonp({});
};
