var googleSheet = require('./google_sheet');

function addUser(user) {
	User.find(function(err, users) {
		var num = users.length + 1;
    	googleSheet.addUser(user, num);
	});
}

function addOrder(creator, assignee, orderId) {
	User.findOne({username: assignee}, function(err, user) {
		if(err) {
			console.error(err);
			return;
		}
		Order.create({creator: creator.id, assignee: user.id, order: orderId}, function(err) {
			if(err) console.error(err);
			// TODO: Add row to status table
		});
	});
}

module.exports = {
	addUser: addUser,
	addOrder: addOrder,
};
