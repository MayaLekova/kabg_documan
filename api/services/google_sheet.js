var getAuth = require('../../google_auth').auth;
var auth;
getAuth(function(newAuth) {
  auth = newAuth;
});

var google = require('googleapis');
var spreadsheetId = require('../../config/local.js').google.spreadsheetId;
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

function addUser(user, row) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: 'Contracts!A' + row + ':J',
    valueInputOption: 'USER_ENTERED',
    resource: {
      "values": [
        [user.username, user.email, null, null, null, null, null, 'не', null, null]
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
  setOrderStatus: setOrderStatus,
  setContractStatus: setContractStatus
};
