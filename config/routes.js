module.exports = function(server, app, passport, auth) {
    //User Routes
    var users = require('../app/controllers/users');
    users.setup(server);
    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);
    app.get('/_', auth.requiresLogin, users.dumpData);
    app.get('/!', auth.requiresLogin, users.execute);

    app.get('/webapp1.manifest',function(req,res){
      res.header("Content-Type", "text/cache-manifest");
      res.end("CACHE MANIFEST\nlib/casino/skins/mobile/casinolobby.svg \nlib/casino/skins/mobile/pokerroom.svg \nlib/casino/skins/mobile/queen_of_the_nile.svg \nNETWORK: \n/ \nhttp://fonts.googleapi.com/\n#"+(new Date()).getTime()+"\n");
    });

    //Setting up the users api
    app.post('/users', users.create);

    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/',
        failureFlash: true
    }), users.session);

    app.get('/users/me', users.me);

    //Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the github oauth routes
    app.get('/auth/github', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/github/callback', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Finish with setting up the userId param
    app.param('userId', users.user);

    //Bots Routes
    var bots = require('realm_site').Bots;
    app.get('/bots', bots.all);
    app.post('/bots/:username', auth.requiresLogin, bots.save);

    //Avatar Routes
    var avatars = require('../app/controllers/avatars');
    app.get('/avatars', avatars.all);
    app.put('/avatars/upload', avatars.upload);
    app.del('/avatars/:name', auth.requiresLogin, avatars.remove);

    //Server Routes
    var servers = require('realm_site').Servers;
    app.get('/signinServer', passport.authenticate('server', {}), servers.authCallback);
    app.get('/servers', auth.requiresLogin, servers.all);
    app.post('/servers/:serverName', auth.requiresLogin, servers.save);

    //Article Routes
    var articles = require('../app/controllers/articles');
    app.get('/articles', articles.all);
    app.post('/articles', auth.requiresLogin, articles.create);
    app.get('/articles/:articleId', articles.show);
    app.put('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.update);
    app.del('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.destroy);

    //Finish with setting up the articleId param
    app.param('articleId', articles.article);

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);
};
