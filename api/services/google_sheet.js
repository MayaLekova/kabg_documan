var getAuth = require('../../google_auth').auth;
if(!getAuth()) {
  var auth = getAuth();
}
var google = require('googleapis');
var spreadsheetId = '1Vha28cqZIrYkDMBgbqfCCzZVsXomUZqGc_Ju8m8K0oo';
var key = 'AIzaSyCbtBn8lrWIOH-749Qt71gBqwHcDGLj_E4';

function listFields() {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
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

function addUser() {
  var user = {
    username: 'Baba',
    email: 'baba@family.com'
  };

  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: 'Contracts!A3:J',
    valueInputOption: 'USER_ENTERED',
    resource: [
      [user.username, null, null, null, null, null, null, null, user.email]
    ],
    key: key,
  }, function(err, response) {
    if(err){
      console.log('The API returned an error: ' + err);
      return;
    }
  })
}

module.exports = {
  listFields: listFields,
  addUser: addUser,
};
