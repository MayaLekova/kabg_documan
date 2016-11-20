/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create: function (req, res) {
		User.find({}, function(err, users) {
			if(err) {
				console.error(err);
				return res.redirect('/');
			}
			res.view('new_order', { users: users });
		});
	},
	getAllDocumentsByUsername: function(req, res) {
		var documents = [];
		User.findOne({username: req.params.username}, function(err, user) {
			if(err) {
				console.error(err);
				return res.json([]);
			}
			Order.find({assignee: user.id}, function(err, orders) {
				if(err) {
					console.error(err);
					return res.json([]);
				}

				orders.forEach(function(order) {
					Document.find({order: order}, function(err, docs) {
					console.log('Docs:', docs);
						if(err) {
							console.error(err);
							return res.json([]);
						}
						documents = documents.concat(docs);
					});
				});
				return res.json(documents);
			});
		});
	},
	getAll: function(req, res) {
		var documents = {};
		Order.find()
			.populate('assignee')
			.exec(function(err, orders) {
				if(err) {
					console.error(err);
					return res.serverError(err);
				}

				async.each(orders, function(order, cb) {
					Document.find({order: order.id}, function(err, docs) {
						err && cb(err);
						documents[order.id] = docs;
						cb(null);
					});
				}, function(err) {
					if(err) {
						console.error(err);
						return res.serverError(err);							
					}						
					return res.view('orders', {
						orders: orders,
						documents: documents,
					});
				});
			});
	}
};

