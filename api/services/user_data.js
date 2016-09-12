var googleSheet = require('./google_sheet');

function addUser(user) {
	User.find(function(err, users) {
		var num = users.length + 1;
    	googleSheet.addUser(user, num);
	});
}

module.exports = {
	addUser: addUser,
};
