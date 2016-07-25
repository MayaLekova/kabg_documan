/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var local = require('../../config/local.js');

module.exports = {
	


  /**
   * `UserController.list()`
   */
  list: function (req, res) {
    return res.json({
      todo: 'list() is not implemented yet!'
    });
  },


  /**
   * `UserController.get()`
   */
  get: function (req, res) {
    return res.json(req.user);
  },

  /**
   * `UserController.homepage()`
   */
  homepage: function (req, res) {
    Document.find({owner: req.user.username}, function(err, docs) {
      if(err)
        return res.serverError(err);
      Notifications.find({toUser: req.user.username, dismissed: false}, function(err, notifications) {
        if(err)
          return res.serverError(err);

        return res.view('homepage', {
          user: req.user,
          youAreUsingJade: true,
          documents: docs,
          notifications: notifications,
          admin: local.admins.indexOf(req.user.username) >= 0
        });        
      })
    });
  }
};

