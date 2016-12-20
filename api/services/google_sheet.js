var getAuth = require('../../google_auth').auth;
var auth;
getAuth(function(newAuth) {
  auth = newAuth;
});

var fs = require('fs');
var google = require('googleapis');
var local = require('../../config/local.js');
var spreadsheetId = local.google.spreadsheetId;
var key = 'AIzaSyCbtBn8lrWIOH-749Qt71gBqwHcDGLj_E4';

function listFields() {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    // auth: auth,
    spreadsheetId: spreadsheetId,
    range: 'Contracts!A2:J',
    key: key
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      console.log('Name, Remarks:');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        console.log('%s, %s', row[0], row[9]);
      }
    }
  });
}

function createFolder(name, cb, parent) {
  var drive = google.drive({ version: 'v3', auth: auth });
  var folderId = parent || local.google.documentRoot;

  drive.files.create({
    resource: {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [folderId]
    }
  }, function(err, result) {
    if(err) {
      console.error('Error creating folder in Google Drive', err);
      cb(err);
    } else {
      console.log('Created folder in Google Drive:', result);
      cb(null, result.id);
    }
  });
}

function uploadFile(file, callback, parent) {
  var drive = google.drive({ version: 'v3', auth: auth });
  var folderId = parent || local.google.documentRoot;

  drive.files.create({
    resource: {
      name: file.filename,
      mimeType: file.type,
      parents: [folderId]
    },
    media: {
      mimeType: file.type,
      body: fs.createReadStream(file.fd)
    }
  }, callback);
}

function addUser(user, row) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: 'Contracts!A' + row + ':J',
    valueInputOption: 'USER_ENTERED',
    resource: {
      "values": [
        [user.username, user.email, user.crowdin, user.facebook, user.skype, user.upwork, null, 'не', null, 'Създаден автоматично']
      ]
    },
    key: key,
  }, function(err, response) {
    if(err){
      console.log('The API returned an error: ' + err);
      return;
    }
  });

  createFolder(user.username, function(err, folderId) {
    User.findOne({username: user.username}, function(err, user) {
      if(err) {
        console.error(err);
        return;
      }
      user.folderId = folderId;
      user.save();
    });
  });
}

function addOrder(order, row, callback) {
  async.parallel([
    function(cb) {
      var sheets = google.sheets('v4');
      sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: 'Orders!A' + row + ':L',
        valueInputOption: 'USER_ENTERED',
        resource: {
          "values": [
            [order.id, order.assignee.fullname, 'не', null, 'не', 'не', 'не', 'не', 'не', 'не', 'не', 'не']
          ]
        },
        key: key,
      }, function(err, response) {
        cb(err);
      });
    }, function(cb) {
      createFolder(order.assignedOn.toDateString(), function(err, folderId) {
        order.folderId = folderId;
        order.save(function(err) {
          cb(err);
        });
      }, order.assignee.folderId);
    }], function(err, result) {
      console.log('Calling callback from addOrder');
      if(err) {
        console.error('Error from addOrder: ' + err);
      }
      callback(err);
    });
}

function setContractStatus(username, status) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: 'Contracts!A:J',
    key: key
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var values = response.values;
    for(var i = 0; i < values.length; i++) {
      var rowData = values[i];
      var name = rowData[0];
      if(name != username) continue;

      var col = 'H';
      var row = i + 1;
      sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: 'Contracts!' + col + row,
        valueInputOption: 'USER_ENTERED',
        resource: {
          "values": [
            [status]
          ]
        },
        key: key,
      }, function(err, response) {
        if(err){
          console.log('The API returned an error: ' + err);
          return;
        }
      });
    }
  });

}

function getOrderPosition(order, changeType, callback) {
  var changeTypeToCol = {
    "declaration": "G",
    "order": "C",
    "protocol": "E",
    "receipt": "H",
    "renumerationForm": "I",
  }
  var col = changeTypeToCol[changeType];

  var rowIdx = 0;

  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: 'Orders!A2:L',
    key: key
  }, function(err, response) {
    if (err) {
      console.error('Error from getOrderPosition: The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.error('Error from getOrderPosition: No data found.');
    } else {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if(row[0] == order.id) {
          rowIdx = i;
          break;
        }
      }
      if(i == rows.length) {
        console.error('Error from getOrderPosition: Order not found, ID:', order.id);
      }
    }
    // +1 for the head row
    // +1 for 1-based numbering
    callback(col, rowIdx + 2);
  });
}

function setOrderStatus(col, row, status) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: 'Orders!' + col + row,
    valueInputOption: 'USER_ENTERED',
    resource: {
      "values": [
        [status]
      ]
    },
    key: key,
  }, function(err, response) {
    if(err){
      console.log('The API returned an error: ' + err);
      return;
    }
  });
}

module.exports = {
  listFields: listFields,
  addUser: addUser,
  addOrder: addOrder,
  setOrderStatus: setOrderStatus,
  getOrderPosition: getOrderPosition,
  setContractStatus: setContractStatus,
  uploadFile: uploadFile,
};
