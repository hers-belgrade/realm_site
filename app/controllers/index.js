/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('underscore');


exports.render = function(req, res) {
    res.render(req.user&&req.user.roles&&req.user.roles.split(',').indexOf('player')>=0 ? 'play' : 'index', {
        user: req.user ? JSON.stringify(req.user) : "null"
    });
};
