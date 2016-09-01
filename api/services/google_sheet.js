var auth = require('../../google_auth').auth;
if(!auth()) {
  auth();
}
var google = require('googleapis');

function listFields(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1Vha28cqZIrYkDMBgbqfCCzZVsXomUZqGc_Ju8m8K0oo',
    range: 'Contracts!A2:J',
    key: 'AIzaSyCbtBn8lrWIOH-749Qt71gBqwHcDGLj_E4'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      console.log('Name, Mail:');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        console.log('%s, %s', row[0], row[9]);
      }
    }
  });
}

module.exports = {
  listMajors: listMajors
};
