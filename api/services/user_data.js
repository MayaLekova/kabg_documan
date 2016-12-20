var googleSheet = require('./google_sheet');
var uploadFile = googleSheet.uploadFile;

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
		    		googleSheet.addOrder(order, num, function(err) {
		    			callback(null, order);
		    		});
				})
			});
		});
	});
}

function upload(file, parentFolder) {
	uploadFile(file, function(err, result) {
		if(err) {
			console.error('Error uploading file to Google Drive', err);
		} else {
			console.log('Uploaded file to Google Drive:', result);
		}
	}, parentFolder);
}

function addDocument(file, document) {
	if(document.type == 'contract') {
		User.findOne({username: document.owner}, function(err, user) {
			upload(file, user.folderId);
		});
	} else {
		Order.findOne({id: document.order}, function(err, order) {
			upload(file, order.folderId);
		});
	}
}

function updateDocStatus(document, status) {
	Order.findOne({id: document.order}, function(err, order) {
		if(err) {
			console.error('Error from updateDocStatus:', err);
			return;
		}
		if(!order) {
			console.error('Error from updateDocStatus: order not found, id:', document.order);
			return;
		}
		googleSheet.getOrderPosition(order, document.type, function(col, row) {
			googleSheet.setOrderStatus(col, row, status);
		});
	});
}

module.exports = {
	addUser: addUser,
	addOrder: addOrder,
	addDocument: addDocument,
	updateDocStatus: updateDocStatus,
};
