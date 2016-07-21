/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
      Notifications.find({toUser: req.user.username}, function(err, notifications) {
        if(err)
          return res.serverError(err);
        
        return res.view('homepage', {
          user: req.user,
          youAreUsingJade: true,
          documents: docs,
          notifications: notifications
        });        
      })
    });
  }
};

