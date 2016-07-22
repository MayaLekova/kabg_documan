/**
 * NotificationsController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	dismiss: function(req, res) {
		Notifications.update(req.params.id, {dismissed:true}, function(err) {
			res.redirect('/');
		});
	}
};

