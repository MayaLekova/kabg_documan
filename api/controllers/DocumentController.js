/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');
var fs = require('fs');
var local = require('../../config/local.js');
var ObjectId = require('mongodb').ObjectID;
var uploadFile = require('../../google_auth').upload;
var googleSheet = require('../services/google_sheet');
var mailer = require('../services/mailer');
var userData = require('../services/user_data');

var docTypeToReadable = {
  "contract": "договор",
  "declaration": "декларация",
  "order": "поръчка",
  "protocol": "протокол",
}

module.exports = {
  /**
   * `DocumentController.list()`
   */
  list: function (req, res) {
      Document.find({owner: req.user.username}, function(err, data) {
        return res.json(data);
    });
  },

  /**
   * `DocumentController.upload()`
   */
  upload: function  (req, res) {
    req.file('document').upload({ saveAs: function(fileStream, cb) {
      function padTo2(num) {
        return num <= 9 ? '0' + num : '' + num;
      }

      var ret = docTypeToReadable[req.query.type] + '_';
      ret += (req.query.originalOwner ? req.query.originalOwner : req.user.username);
      ret += '_';

      var d = new Date();
      ret += (d.getUTCFullYear() + padTo2(d.getUTCMonth()) + padTo2(d.getUTCDate()));
      ret += path.extname(fileStream.filename);
      cb(null, ret);
    } }
      , function (err, files) {
      if (err)
        return res.serverError(err);

      if(files.length >= 1) {
        files[0].filename = path.basename(files[0].fd);
        Document.create(
          { name : files[0].filename,
            owner : (req.query.originalOwner ? req.query.originalOwner : req.user.username),
            path : path.basename(files[0].fd),
            type : req.query.type,
            signedByUser: true,
            signedByAdmin: !!req.query.signedByAdmin,
          })
          .exec(function (err, created){
            if(err) return console.error(err);

            uploadFile(files[0], function(err, result) {
              if(err) {
                console.error('Error uploading file to Google Drive', err);
              } else {
                console.log('Uploaded file to Google Drive:', result);
              }
            });
            if(req.query.type == 'order') {
              userData.addOrder(req.user, /\((\w+)\)/.exec(req.body.username)[1], created.id);
            }
            if(!created.signedByAdmin) {
              Notifications.create(local.admins.map(function(adminName) {
                return {
                  text: 'Потребителят ' + req.user.username + ' качи нов(а) ' + docTypeToReadable[req.query.type],
                  path: path.basename(files[0].fd),
                  toUser: adminName,
                  doc_id: created.id,
                  originatedBy: req.user.username
                };
              })).exec(function (err, notifsCreated) {
                if(err) console.error(err);
                return res.redirect('/');
              });
            } else {
              if(req.query.type == 'contract') {
                googleSheet.setContractStatus(req.query.originalOwner, 'да');
              }
              return res.redirect('/');
            }
          });
      }
    });
  },

  update: function(req, res) {
    Document.findOne({ id: req.params.doc_id }).exec(function(err, found) {
      if(err || !found) {
        return res.serverError(err || new Error('Cannot find such document'));
      }
      res.view('update_doc', {doc: found});
    });
  },

  /**
   * `DocumentController.upload()`
   */
  download: function(req, res) {
    var basePath = path.join(__dirname, '../../.tmp/uploads/');
    try {
      rs = fs.createReadStream(path.join(basePath, req.params.doc_path));
      rs.pipe(res);
    } catch(err) {
        return res.serverError(err);
    }
  },

  send: function (req, res) {
    Document.update({ id: req.params.doc_id }, { sent: true }).exec(function(err, updated) {
      if(err) {
        return res.serverError(err);
      }
      
      var mailText = '<p>Здравейте!</p><p>Приложено Ви изпращаме ' + updated[0].type + ' документ. </p><p> Поздрави, Документчо <p>' +
                     '<p></p><p><small>Това писмо е автоматично генерирано от системата Documan.</small></p>';
      var subject = 'Променен статус на документ';
      var fullPath = path.join(__dirname, '../../.tmp/uploads/', updated[0].path);

      try {
        mailer.sendMail(local.email.receiver, subject, mailText, updated[0].path, fullPath);
      } catch(err) {
        return res.serverError(err);
      }
      
      return res.redirect('/');
    });
  },

  pay: function (req, res) {
    Document.update({ id: req.params.doc_id }, { paid: true }).exec(function(err, updated) {
      if(err) {
        return res.serverError(err);
      }
      return res.redirect('/');
    });
  },
  
  unsent: function (req, res) {
    Document.find({ sent: false, signedByAdmin: true }).exec(function(err, found) {
      return res.view('unsent', { documents: found });
    });
  },
  
  unpaid: function (req, res) {
    Document.find({ paid: false, signedByAdmin: true }).exec(function(err, found) {
      return res.view('unpaid', { documents: found });
    });
  },
  
  ready: function (req, res) {
    Document.find({ paid: true, sent: true, signedByAdmin: true }).exec(function(err, found) {
      return res.view('ready', { documents: found });
    });
  },

  status: function(req, res) {
    return res.view('status_table', { spreadsheetId: local.google.spreadsheetId });
  }

};

