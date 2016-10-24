var googleSheet = require('./google_sheet');

function addUser(user) {
	User.find(function(err, users) {
		var num = users.length + 1;
    	googleSheet.addUser(user, num);
	});
}

function addOrder(creator, assignee, orderId, callback) {
	User.findOne({username: assignee}, function(err, user) {
		if(err) {
			console.error(err);
			return callback(err);
		}
		Order.create({creator: creator.id, assignee: user.id, order: orderId}, function(err, created) {
			if(err) {
				console.error(err);
				return callback(err);
			}
			Order.find(function(err, orders) {
				var num = orders.length + 1;
				Order.findOne({id: created.id}).populate('assignee').exec(function(err, order) {
		    		googleSheet.addOrder(order, num);
		    		callback(null, order);
				})
			});
		});
	});
}

module.exports = {
	addUser: addUser,
	addOrder: addOrder,
};
