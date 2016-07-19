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
  }
};

