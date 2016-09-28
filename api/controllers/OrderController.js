/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getAllDocumentsByUsername: function(req, res) {
		var documents = [];
		User.findOne({username: req.params.username}, function(err, user) {
			if(err) {
				console.error(err);
				return res.json([]);
			}
			console.log('User:', user);
			Order.find({assignee: user.id}, function(err, orders) {
				if(err) {
					console.error(err);
					return res.json([]);
				}
				console.log('Orders:', orders);

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
	}
};

